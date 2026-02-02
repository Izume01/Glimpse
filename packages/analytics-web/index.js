/**
 * Glimpse Analytics SDK v2.0
 * Lightweight, privacy-focused analytics for the web
 * 
 * Works with: Vanilla JS, React, Next.js, Vue, Svelte, and any framework
 */

// SSR safety check
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Initialize in browser only
if (isBrowser) {
    initBrowser();
}

async function initBrowser() {
    // Dynamic imports for browser-only modules
    const [
        { track, trackNow },
        { identify, setTraits, reset, alias },
        { trackPageView },
        { default: trackOnView },
        { getAnonymousId, getUserId },
        { getSessionId, getSessionDuration },
        { flush }
    ] = await Promise.all([
        import('./events/track.js'),
        import('./events/identify.js'),
        import('./events/navigation.js'),
        import('./events/trackonView.js'),
        import('./core/identity.js'),
        import('./core/session.js'),
        import('./transport/sender.js')
    ]);

    // Get configuration from script tag (for vanilla JS usage)
    const script = document.currentScript
        || document.querySelector('script[data-project-id][src*="analytics"]')
        || document.querySelector('script[data-project-id]');

    const projectId = script?.getAttribute('data-project-id') || undefined;
    const endpoint = script?.getAttribute('data-endpoint') || undefined;
    const autoTrack = script?.getAttribute('data-auto-track') !== 'false';
    const debug = script?.getAttribute('data-debug') === 'true';

    // Initialize global tracker
    window.GlimpseTracker = {
        // Config
        projectId,
        endpoint,
        debug,
        
        // Initialization (for frameworks)
        init: (options = {}) => {
            if (options.projectId) {
                window.GlimpseTracker.projectId = options.projectId;
            }
            if (options.endpoint) {
                window.GlimpseTracker.endpoint = options.endpoint;
            }
            if (options.debug !== undefined) {
                window.GlimpseTracker.debug = options.debug;
            }
            
            // Load auto-tracking if enabled and projectId is set
            if (options.autoTrack !== false && window.GlimpseTracker.projectId) {
                import('./events/auto.js').catch(console.error);
            }
            
            return window.GlimpseTracker;
        },
        
        // Core tracking
        track,
        trackNow,
        trackPageView,
        trackOnView,
        
        // Identity
        identify,
        setTraits,
        reset,
        alias,
        
        // Utilities
        getAnonymousId,
        getUserId,
        getSessionId,
        getSessionDuration,
        flush,
        
        // Version
        version: '2.0.0'
    };

    // Dispatch event so frameworks know SDK is ready
    window.dispatchEvent(new CustomEvent('glimpse:ready', { detail: window.GlimpseTracker }));

    // Auto-tracking (only if projectId is set via script tag)
    if (projectId && autoTrack) {
        import('./events/auto.js')
            .then(() => {
                if (debug) {
                    console.info('GlimpseTracker: initialized with auto-tracking');
                }
            })
            .catch((err) => {
                console.warn('GlimpseTracker: auto-tracking failed', err);
            });
    } else if (!projectId && script) {
        console.warn('GlimpseTracker: missing data-project-id. Use init({ projectId: "..." }) or add it to the script tag.');
    }
}

const noop = () => {};

function getTracker() {
    return isBrowser ? window.GlimpseTracker : null;
}

export function track(name, properties) {
    getTracker()?.track?.(name, properties);
}

export function trackNow(name, properties) {
    getTracker()?.trackNow?.(name, properties);
}

export function trackPageView(path, properties) {
    getTracker()?.trackPageView?.(path, properties);
}

export function trackOnView(selector, eventName, properties, options) {
    return getTracker()?.trackOnView?.(selector, eventName, properties, options) || noop;
}

export function identify(userId, traits) {
    getTracker()?.identify?.(userId, traits);
}

export function setTraits(traits) {
    getTracker()?.setTraits?.(traits);
}

export function reset() {
    getTracker()?.reset?.();
}

export function alias(newUserId) {
    getTracker()?.alias?.(newUserId);
}

export function flush() {
    getTracker()?.flush?.();
}

export function getAnonymousId() {
    return getTracker()?.getAnonymousId?.() || null;
}

export function getUserId() {
    return getTracker()?.getUserId?.() || null;
}

export function getSessionId() {
    return getTracker()?.getSessionId?.() || null;
}

export function getSessionDuration() {
    return getTracker()?.getSessionDuration?.() || 0;
}

/**
 * Initialize Glimpse SDK
 * For frameworks: call in useEffect (React) or onMounted (Vue)
 * 
 * @param {Object} options
 * @param {string} options.projectId - Your project ID (required)
 * @param {string} options.endpoint - API endpoint (optional)
 * @param {boolean} options.autoTrack - Enable auto-tracking (default: true)
 * @param {boolean} options.debug - Enable debug logging (default: false)
 * @returns {Promise<Object|null>} The tracker instance or null on server
 * 
 * @example
 * // React
 * useEffect(() => {
 *   initGlimpse({ projectId: 'my-project' });
 * }, []);
 * 
 * // Vue
 * onMounted(() => {
 *   initGlimpse({ projectId: 'my-project' });
 * });
 */
export async function initGlimpse(options = {}) {
    if (!isBrowser) {
        return null;
    }

    // Wait for SDK to be ready if not yet initialized
    if (!window.GlimpseTracker) {
        await new Promise((resolve, reject) => {
            if (window.GlimpseTracker) {
                resolve();
            } else {
                const timeout = setTimeout(() => {
                    reject(new Error('GlimpseTracker initialization timeout'));
                }, 5000);
                window.addEventListener('glimpse:ready', () => {
                    clearTimeout(timeout);
                    resolve();
                }, { once: true });
            }
        });
    }

    return window.GlimpseTracker?.init?.(options) || null;
}

/**
 * Get the tracker instance (SSR-safe)
 */
export { getTracker };

/**
 * Check if running in browser
 */
export { isBrowser };

// Default export
export default {
    track,
    trackNow,
    trackPageView,
    trackOnView,
    identify,
    setTraits,
    reset,
    alias,
    flush,
    getAnonymousId,
    getUserId,
    getSessionId,
    getSessionDuration,
    initGlimpse,
    getTracker,
    isBrowser
};
