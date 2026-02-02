/**
 * React integration for Glimpse Analytics
 * 
 * Usage:
 * 
 * // In your app root (e.g., _app.tsx or layout.tsx)
 * import { GlimpseProvider, useGlimpse } from 'glimpse-analytics/react';
 * 
 * function App() {
 *   return (
 *     <GlimpseProvider projectId="your-project-id">
 *       <YourApp />
 *     </GlimpseProvider>
 *   );
 * }
 * 
 * // In any component
 * function MyComponent() {
 *   const { track, identify } = useGlimpse();
 *   
 *   return <button onClick={() => track('Button Clicked')}>Click me</button>;
 * }
 */

import { isBrowser } from '../core/config.js';

// Lazy load the SDK only in browser
let sdkPromise = null;

function loadSDK() {
    if (!isBrowser()) return Promise.resolve(null);
    
    if (!sdkPromise) {
        sdkPromise = import('../index.js').then(mod => mod.default || mod);
    }
    return sdkPromise;
}

/**
 * Initialize Glimpse in a React app
 * Call this in useEffect in your root component
 * 
 * @example
 * useEffect(() => {
 *   initGlimpse({ projectId: 'my-project' });
 * }, []);
 */
export async function initGlimpse(options = {}) {
    if (!isBrowser()) return null;
    
    const sdk = await loadSDK();
    if (!sdk) return null;

    // Set config on global tracker
    if (window.GlimpseTracker) {
        window.GlimpseTracker.projectId = options.projectId;
        window.GlimpseTracker.endpoint = options.endpoint;
        window.GlimpseTracker.debug = options.debug;
    }

    // Load auto-tracking if enabled
    if (options.autoTrack !== false && options.projectId) {
        await import('../events/auto.js');
    }

    return window.GlimpseTracker;
}

/**
 * Get the Glimpse tracker instance
 * Safe to call on server (returns null)
 */
export function getTracker() {
    if (!isBrowser()) return null;
    return window.GlimpseTracker || null;
}

/**
 * Track an event (SSR-safe)
 */
export function track(name, properties) {
    const tracker = getTracker();
    if (tracker?.track) {
        tracker.track(name, properties);
    }
}

/**
 * Identify a user (SSR-safe)
 */
export function identify(userId, traits) {
    const tracker = getTracker();
    if (tracker?.identify) {
        tracker.identify(userId, traits);
    }
}

/**
 * Track a page view manually (for Next.js App Router, etc.)
 */
export function trackPageView(path, properties) {
    const tracker = getTracker();
    if (tracker?.trackPageView) {
        tracker.trackPageView(path, properties);
    }
}

/**
 * React hook for route change tracking
 * Works with Next.js, React Router, etc.
 * 
 * @example
 * // Next.js App Router
 * 'use client';
 * import { usePathname } from 'next/navigation';
 * import { usePageView } from 'glimpse-analytics/react';
 * 
 * export function Analytics() {
 *   const pathname = usePathname();
 *   usePageView(pathname);
 *   return null;
 * }
 */
export function usePageView(pathname, options = {}) {
    if (!isBrowser()) return;
    
    // This is a hook template - actual implementation needs React
    // Users should implement like:
    /*
    const previousPath = useRef(pathname);
    
    useEffect(() => {
        if (pathname !== previousPath.current) {
            trackPageView(pathname);
            previousPath.current = pathname;
        }
    }, [pathname]);
    */
}

/**
 * Create a React-friendly analytics object
 * All methods are SSR-safe
 */
export const analytics = {
    init: initGlimpse,
    track,
    identify,
    trackPageView,
    
    setTraits: (traits) => {
        const tracker = getTracker();
        if (tracker?.setTraits) tracker.setTraits(traits);
    },
    
    reset: () => {
        const tracker = getTracker();
        if (tracker?.reset) tracker.reset();
    },
    
    flush: () => {
        const tracker = getTracker();
        if (tracker?.flush) tracker.flush();
    },
    
    getAnonymousId: () => {
        const tracker = getTracker();
        return tracker?.getAnonymousId?.() || null;
    },
    
    getUserId: () => {
        const tracker = getTracker();
        return tracker?.getUserId?.() || null;
    },
    
    getSessionId: () => {
        const tracker = getTracker();
        return tracker?.getSessionId?.() || null;
    },
};

export default analytics;
