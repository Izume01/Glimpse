import { track } from "./track.js";

// Auto Track Page View
track('Page View' , {
    "path" : location.pathname,
    "referrer": document.referrer || undefined,
})

// Auto Track Session Start
track('Session Start');

// Scroll Depth Tracking
const scrollMilestones = [10, 25, 50, 75, 90, 100];
const reachedMilestones = new Set();

function getScrollDepth() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;

    const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    )

    const scrollDepth = (scrollTop + windowHeight) / docHeight;

    const scrollDepthPercent = Math.floor(scrollDepth * 100);

    return Math.min(scrollDepthPercent, 100);
}

window.addEventListener('scroll', () => {
    const percentage = getScrollDepth();
    for (const milestone of scrollMilestones) {
        if (percentage >= milestone && !reachedMilestones.has(milestone)) {
            reachedMilestones.add(milestone);
            track('Scroll Depth', { depth: milestone });
        }
    }
})

// Element Visibility Tracking (scroll to specific elements)
const viewedElements = new Set();

function setupElementVisibilityTracking() {
    const elementsToTrack = document.querySelectorAll('[data-track-view]');
    
    if (elementsToTrack.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const elementId = el.id || el.getAttribute('data-track-view') || el.tagName;
                
                if (!viewedElements.has(el)) {
                    viewedElements.add(el);
                    track('Element Viewed', {
                        elementId: elementId,
                        elementName: el.getAttribute('data-track-name') || elementId,
                        elementTag: el.tagName.toLowerCase()
                    });
                }
            }
        });
    }, {
        threshold: 0.5 // Element is 50% visible
    });

    elementsToTrack.forEach(el => observer.observe(el));
}

// Run after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupElementVisibilityTracking);
} else {
    setupElementVisibilityTracking();
}

// Auto Track Visibility Change
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        track('Page Hidden');
    } else if (document.visibilityState === 'visible') {
        track('Page Visible');
    }
});

// Auto Track Out bound Link Clicks
document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'A' && target.href) {
        const linkHost = new URL(target.href).host;
        if (linkHost !== window.location.host) {
            track('Outbound Link Click', { url: target.href });
        }
    }
});

// Auto Track Errors
window.addEventListener('error', (event) => {
    track('JavaScript Error', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error ? event.error.stack : undefined
    });
});

window.addEventListener('unhandledrejection', (event) => {
    track('Unhandled Promise Rejection', {
        reason: event.reason ? (event.reason.stack || event.reason) : 'unknown'
    });
});

// File Download Tracking
document.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'A' && target.href) {
        const url = new URL(target.href);
        const fileExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', '7z', 'exe', 'dmg'];
        const path = url.pathname.toLowerCase();
        for (const ext of fileExtensions) {
            if (path.endsWith(`.${ext}`)) {
                track('File Download', { url: target.href, fileType: ext });
                break;
            }
        }
    }
});

// Auto Track Session End on unload
window.addEventListener('beforeunload', () => {
    track('Session End');
});

// Form Interaction Tracking
document.addEventListener('submit', (event) => {
    const target = event.target;
    if (target.tagName === 'FORM') {
        track('Form Submitted', { formAction: target.action || undefined });
    }
});

// Button / CTA Click Tracking
document.querySelectorAll('button[data-track]').forEach(btn => {
    btn.addEventListener('click', () => {
        const btnName = btn.getAttribute('data-track-name') || btn.innerText || 'Unnamed Button';
        track('Button Click', { buttonName: btnName });
    });
})

