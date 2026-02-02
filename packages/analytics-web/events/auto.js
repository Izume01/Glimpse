import { track, trackNow } from "./track.js";
import { initNavigationTracking } from "./navigation.js";
import { initPerformanceTracking } from "./performance.js";
import { initEngagementTracking } from "./engagement.js";
import { isNewSession, getSessionDuration } from "../core/session.js";

/**
 * Auto-tracking module - initializes all automatic tracking
 */

// ═══════════════════════════════════════════════════════════════════
// SESSION TRACKING
// ═══════════════════════════════════════════════════════════════════

if (isNewSession()) {
    track('Session Start', {
        referrer: document.referrer || undefined,
        landingPage: location.pathname
    });
}

// ═══════════════════════════════════════════════════════════════════
// CORE TRACKING
// ═══════════════════════════════════════════════════════════════════

initNavigationTracking();
initPerformanceTracking();
initEngagementTracking();

// ═══════════════════════════════════════════════════════════════════
// SCROLL DEPTH MILESTONES
// ═══════════════════════════════════════════════════════════════════

const scrollMilestones = [25, 50, 75, 90, 100];
const reachedMilestones = new Set();

function getScrollDepth() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );
    return Math.min(Math.round(((scrollTop + windowHeight) / docHeight) * 100), 100);
}

window.addEventListener('scroll', () => {
    const depth = getScrollDepth();
    for (const milestone of scrollMilestones) {
        if (depth >= milestone && !reachedMilestones.has(milestone)) {
            reachedMilestones.add(milestone);
            track('Scroll Milestone', { depth: milestone });
        }
    }
}, { passive: true });

// ═══════════════════════════════════════════════════════════════════
// ELEMENT VISIBILITY TRACKING
// ═══════════════════════════════════════════════════════════════════

const viewedElements = new WeakSet();

function setupElementVisibilityTracking() {
    const elements = document.querySelectorAll('[data-track-view]');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !viewedElements.has(entry.target)) {
                viewedElements.add(entry.target);
                const el = entry.target;
                track('Element Viewed', {
                    elementId: el.id || el.getAttribute('data-track-view'),
                    elementName: el.getAttribute('data-track-name'),
                    elementTag: el.tagName.toLowerCase()
                });
            }
        });
    }, { threshold: 0.5 });

    elements.forEach(el => observer.observe(el));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupElementVisibilityTracking);
} else {
    setupElementVisibilityTracking();
}

// ═══════════════════════════════════════════════════════════════════
// VISIBILITY CHANGE
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('visibilitychange', () => {
    track(document.visibilityState === 'hidden' ? 'Page Hidden' : 'Page Visible', {
        sessionDuration: getSessionDuration()
    });
});

// ═══════════════════════════════════════════════════════════════════
// LINK TRACKING
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    
    const url = new URL(link.href, location.origin);
    
    // Outbound link
    if (url.host !== location.host) {
        track('Outbound Click', {
            url: link.href,
            text: link.innerText?.substring(0, 100),
            destination: url.host
        });
    }
    
    // File download
    const downloadExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'exe', 'dmg', 'apk'];
    const ext = url.pathname.split('.').pop()?.toLowerCase();
    if (ext && downloadExtensions.includes(ext)) {
        track('File Download', {
            url: link.href,
            fileType: ext,
            fileName: url.pathname.split('/').pop()
        });
    }
}, { passive: true });

// ═══════════════════════════════════════════════════════════════════
// FORM TRACKING
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('submit', (event) => {
    const form = event.target;
    if (form.tagName !== 'FORM') return;
    
    track('Form Submit', {
        formId: form.id || undefined,
        formName: form.name || undefined,
        formAction: form.action || undefined,
        formMethod: form.method?.toUpperCase() || 'GET'
    });
}, { passive: true });

// Form field focus tracking (anonymized)
document.addEventListener('focusin', (event) => {
    const input = event.target;
    if (!input.matches('input, textarea, select')) return;
    
    const form = input.closest('form');
    track('Form Field Focus', {
        fieldType: input.type || input.tagName.toLowerCase(),
        fieldName: input.name || undefined,
        formId: form?.id || undefined
    });
}, { passive: true });

// ═══════════════════════════════════════════════════════════════════
// BUTTON / CTA TRACKING
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-track], [role="button"][data-track]');
    if (!button) return;
    
    track('Button Click', {
        buttonId: button.id || undefined,
        buttonName: button.getAttribute('data-track-name') || button.innerText?.substring(0, 50),
        buttonType: button.type || undefined
    });
}, { passive: true });

// ═══════════════════════════════════════════════════════════════════
// ERROR TRACKING
// ═══════════════════════════════════════════════════════════════════

window.addEventListener('error', (event) => {
    track('JavaScript Error', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack?.substring(0, 500)
    });
});

window.addEventListener('unhandledrejection', (event) => {
    track('Promise Rejection', {
        reason: event.reason?.message || String(event.reason)?.substring(0, 200)
    });
});

// ═══════════════════════════════════════════════════════════════════
// MEDIA TRACKING
// ═══════════════════════════════════════════════════════════════════

function setupMediaTracking() {
    const mediaElements = document.querySelectorAll('video[data-track], audio[data-track]');
    
    mediaElements.forEach(media => {
        const mediaId = media.id || media.getAttribute('data-track') || media.src?.split('/').pop();
        const mediaType = media.tagName.toLowerCase();
        
        media.addEventListener('play', () => {
            track('Media Play', { mediaId, mediaType, currentTime: Math.round(media.currentTime) });
        });
        
        media.addEventListener('pause', () => {
            track('Media Pause', { mediaId, mediaType, currentTime: Math.round(media.currentTime) });
        });
        
        media.addEventListener('ended', () => {
            track('Media Complete', { mediaId, mediaType, duration: Math.round(media.duration) });
        });
        
        // Track progress milestones
        const progressMilestones = [25, 50, 75];
        const reachedProgress = new Set();
        
        media.addEventListener('timeupdate', () => {
            const progress = Math.round((media.currentTime / media.duration) * 100);
            for (const milestone of progressMilestones) {
                if (progress >= milestone && !reachedProgress.has(milestone)) {
                    reachedProgress.add(milestone);
                    track('Media Progress', { mediaId, mediaType, progress: milestone });
                }
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMediaTracking);
} else {
    setupMediaTracking();
}

// ═══════════════════════════════════════════════════════════════════
// COPY TRACKING
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('copy', () => {
    const selection = document.getSelection();
    const text = selection?.toString()?.substring(0, 100);
    
    if (text && text.length > 0) {
        track('Text Copied', {
            textLength: selection?.toString()?.length,
            textPreview: text
        });
    }
});

// ═══════════════════════════════════════════════════════════════════
// SESSION END
// ═══════════════════════════════════════════════════════════════════

window.addEventListener('pagehide', () => {
    trackNow('Session End', {
        duration: getSessionDuration()
    });
});
