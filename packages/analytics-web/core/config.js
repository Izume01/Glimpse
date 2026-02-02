/**
 * SDK Configuration
 * Supports both script tag attributes and programmatic initialization
 */

let config = {
    projectId: undefined,
    endpoint: 'http://localhost:3000/event',
    autoTrack: true,
    debug: false,
    trackPageViews: true,
    trackWebVitals: true,
    trackEngagement: true,
    trackErrors: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
};

let initialized = false;

/**
 * Check if running in browser
 */
export function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Get current config
 */
export function getConfig() {
    return { ...config };
}

/**
 * Initialize the SDK programmatically
 * Use this for React, Vue, Next.js, etc.
 */
export function init(options = {}) {
    if (!isBrowser()) {
        console.warn('GlimpseTracker: Cannot initialize on server. Use in useEffect/onMounted.');
        return false;
    }

    if (initialized && !options.force) {
        if (config.debug) console.info('GlimpseTracker: Already initialized');
        return true;
    }

    config = {
        ...config,
        ...options,
    };

    if (!config.projectId) {
        console.warn('GlimpseTracker: projectId is required');
        return false;
    }

    initialized = true;

    // Update global tracker
    if (window.GlimpseTracker) {
        window.GlimpseTracker.projectId = config.projectId;
        window.GlimpseTracker.endpoint = config.endpoint;
        window.GlimpseTracker.debug = config.debug;
    }

    if (config.debug) {
        console.info('GlimpseTracker: Initialized', config);
    }

    return true;
}

/**
 * Check if SDK is initialized
 */
export function isInitialized() {
    return initialized;
}

/**
 * Reset initialization (for testing)
 */
export function resetInit() {
    initialized = false;
}
