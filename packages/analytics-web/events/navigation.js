import { track } from "./track.js";
import { incrementPageViewCount } from "../core/session.js";

/**
 * SPA Navigation tracking - works with React Router, Next.js, Vue Router, etc.
 */

let currentPath = location.pathname + location.search;
let pageViewStartTime = Date.now();

/**
 * Track a page view
 */
function trackPageView(path, options = {}) {
    const timeOnPreviousPage = Date.now() - pageViewStartTime;
    pageViewStartTime = Date.now();
    
    const pageViewCount = incrementPageViewCount();
    
    track('Page View', {
        path: path || location.pathname,
        search: location.search || undefined,
        hash: location.hash || undefined,
        title: document.title,
        referrer: options.referrer || document.referrer || undefined,
        previousPath: options.previousPath || currentPath,
        timeOnPreviousPage: pageViewCount > 1 ? timeOnPreviousPage : undefined,
        pageViewNumber: pageViewCount,
        navigationType: options.navigationType || 'spa'
    });
    
    currentPath = location.pathname + location.search;
}

/**
 * Hook into History API for SPA navigation
 */
function setupHistoryTracking() {
    // Store original methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    // Override pushState
    history.pushState = function(...args) {
        const result = originalPushState.apply(this, args);
        handleNavigation('pushState');
        return result;
    };
    
    // Override replaceState
    history.replaceState = function(...args) {
        const result = originalReplaceState.apply(this, args);
        handleNavigation('replaceState');
        return result;
    };
    
    // Handle popstate (back/forward)
    window.addEventListener('popstate', () => {
        handleNavigation('popstate');
    });
}

/**
 * Handle navigation events
 */
function handleNavigation(type) {
    const newPath = location.pathname + location.search;
    
    // Only track if path actually changed
    if (newPath !== currentPath) {
        const previousPath = currentPath;
        
        // Use requestAnimationFrame to ensure DOM has updated
        requestAnimationFrame(() => {
            trackPageView(newPath, {
                previousPath,
                navigationType: type
            });
        });
    }
}

/**
 * Track hash changes (for hash-based routing)
 */
function setupHashTracking() {
    window.addEventListener('hashchange', (event) => {
        track('Hash Change', {
            oldHash: new URL(event.oldURL).hash,
            newHash: location.hash,
            path: location.pathname
        });
    });
}

/**
 * Initialize navigation tracking
 */
export function initNavigationTracking() {
    // Track initial page view
    incrementPageViewCount();
    track('Page View', {
        path: location.pathname,
        search: location.search || undefined,
        hash: location.hash || undefined,
        title: document.title,
        referrer: document.referrer || undefined,
        pageViewNumber: 1,
        navigationType: 'initial'
    });
    
    // Setup SPA tracking
    setupHistoryTracking();
    setupHashTracking();
}

/**
 * Manual page view tracking (for frameworks that need it)
 */
export { trackPageView };
