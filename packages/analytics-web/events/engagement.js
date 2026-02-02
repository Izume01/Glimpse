import { track, trackNow } from "./track.js";
import { getSessionDuration, getPageViewCount } from "../core/session.js";

/**
 * Engagement tracking - time on page, interactions, active time
 */

let pageStartTime = Date.now();
let activeTime = 0;
let lastActiveTimestamp = Date.now();
let isActive = true;
let interactionCount = 0;
let maxScrollDepth = 0;
let hasInteracted = false;

// Engagement thresholds
const ENGAGED_TIME_THRESHOLD = 10000; // 10 seconds
const ENGAGED_SCROLL_THRESHOLD = 25; // 25% scroll

/**
 * Track when user becomes active/inactive
 */
function updateActiveTime() {
    const now = Date.now();
    if (isActive) {
        activeTime += now - lastActiveTimestamp;
    }
    lastActiveTimestamp = now;
}

/**
 * Handle visibility change
 */
function handleVisibilityChange() {
    updateActiveTime();
    isActive = document.visibilityState === 'visible';
    lastActiveTimestamp = Date.now();
}

/**
 * Track user interactions
 */
function handleInteraction() {
    if (!hasInteracted) {
        hasInteracted = true;
        track('First Interaction', {
            timeToInteract: Date.now() - pageStartTime
        });
    }
    interactionCount++;
    updateActiveTime();
    isActive = true;
    lastActiveTimestamp = Date.now();
}

/**
 * Track scroll depth
 */
function handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
    );
    
    const scrollDepth = Math.min(
        Math.round(((scrollTop + windowHeight) / docHeight) * 100),
        100
    );
    
    if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
    }
}

/**
 * Determine if user is engaged
 */
function isEngaged() {
    updateActiveTime();
    return activeTime >= ENGAGED_TIME_THRESHOLD || maxScrollDepth >= ENGAGED_SCROLL_THRESHOLD;
}

/**
 * Determine if this is a bounce (left without meaningful engagement)
 */
function isBounce() {
    return getPageViewCount() <= 1 && !isEngaged();
}

/**
 * Track page exit with engagement data
 */
function trackPageExit() {
    updateActiveTime();
    
    trackNow('Page Exit', {
        timeOnPage: Date.now() - pageStartTime,
        activeTime: activeTime,
        interactionCount: interactionCount,
        maxScrollDepth: maxScrollDepth,
        engaged: isEngaged(),
        bounce: isBounce(),
        sessionDuration: getSessionDuration(),
        pageViewsInSession: getPageViewCount()
    });
}

/**
 * Track engagement heartbeat (for long sessions)
 */
let heartbeatInterval = null;
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

function startHeartbeat() {
    if (heartbeatInterval) return;
    
    heartbeatInterval = setInterval(() => {
        if (isActive) {
            updateActiveTime();
            track('Heartbeat', {
                activeTime,
                interactionCount,
                maxScrollDepth,
                pageTime: Date.now() - pageStartTime
            });
        }
    }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

/**
 * Track rage clicks (frustration indicator)
 */
let clickTimestamps = [];
const RAGE_CLICK_THRESHOLD = 3;
const RAGE_CLICK_WINDOW = 500; // 500ms

function handleClick(event) {
    const now = Date.now();
    clickTimestamps.push(now);
    
    // Keep only recent clicks
    clickTimestamps = clickTimestamps.filter(t => now - t < RAGE_CLICK_WINDOW);
    
    if (clickTimestamps.length >= RAGE_CLICK_THRESHOLD) {
        track('Rage Click', {
            clickCount: clickTimestamps.length,
            element: event.target?.tagName?.toLowerCase(),
            elementId: event.target?.id || undefined,
            elementClass: event.target?.className || undefined
        });
        clickTimestamps = [];
    }
}

/**
 * Track dead clicks (clicks that don't do anything)
 */
function handleDeadClick(event) {
    const target = event.target;
    
    // Check if click target looks interactive but might not work
    const isInteractive = target.matches('a, button, input, select, textarea, [role="button"], [onclick]');
    const hasHref = target.tagName === 'A' && target.getAttribute('href');
    const hasClickHandler = target.onclick || target.getAttribute('onclick');
    
    if (!isInteractive && !hasHref && !hasClickHandler) {
        // This might be a dead click on something that looks clickable
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle.cursor === 'pointer') {
            track('Dead Click', {
                element: target.tagName.toLowerCase(),
                elementId: target.id || undefined,
                text: target.innerText?.substring(0, 50) || undefined
            });
        }
    }
}

/**
 * Initialize engagement tracking
 */
export function initEngagementTracking() {
    // Visibility tracking
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Interaction tracking
    document.addEventListener('click', handleInteraction, { passive: true });
    document.addEventListener('keydown', handleInteraction, { passive: true });
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    
    // Scroll tracking
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Rage click detection
    document.addEventListener('click', handleClick, { passive: true });
    
    // Dead click detection
    document.addEventListener('click', handleDeadClick, { passive: true });
    
    // Page exit tracking
    window.addEventListener('pagehide', trackPageExit);
    window.addEventListener('beforeunload', trackPageExit);
    
    // Start heartbeat for long sessions
    startHeartbeat();
    
    // Stop heartbeat when page hidden
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            stopHeartbeat();
        } else {
            startHeartbeat();
        }
    });
}

// Export for manual tracking
export { isEngaged, isBounce, maxScrollDepth, activeTime, interactionCount };
