import { track } from "./track.js";

/**
 * Track Core Web Vitals and page load performance
 */

let pageLoadTracked = false;
let webVitalsTracked = {
    LCP: false,
    FID: false,
    CLS: false,
    FCP: false,
    TTFB: false,
    INP: false
};

/**
 * Track page load timing
 */
export function trackPageLoad() {
    if (pageLoadTracked) return;
    
    // Wait for load event if not fired yet
    if (document.readyState !== 'complete') {
        window.addEventListener('load', () => setTimeout(trackPageLoad, 0));
        return;
    }
    
    pageLoadTracked = true;
    
    const perf = performance.getEntriesByType('navigation')[0];
    if (!perf) return;
    
    track('Page Load', {
        // Navigation timing
        dns: Math.round(perf.domainLookupEnd - perf.domainLookupStart),
        tcp: Math.round(perf.connectEnd - perf.connectStart),
        ssl: perf.secureConnectionStart > 0 ? Math.round(perf.connectEnd - perf.secureConnectionStart) : 0,
        ttfb: Math.round(perf.responseStart - perf.requestStart),
        download: Math.round(perf.responseEnd - perf.responseStart),
        domInteractive: Math.round(perf.domInteractive),
        domContentLoaded: Math.round(perf.domContentLoadedEventEnd),
        domComplete: Math.round(perf.domComplete),
        loadComplete: Math.round(perf.loadEventEnd),
        
        // Transfer info
        transferSize: perf.transferSize,
        encodedBodySize: perf.encodedBodySize,
        decodedBodySize: perf.decodedBodySize,
        
        // Navigation type
        navigationType: perf.type, // 'navigate', 'reload', 'back_forward', 'prerender'
        redirectCount: perf.redirectCount
    });
}

/**
 * Track Largest Contentful Paint (LCP)
 */
export function trackLCP() {
    if (webVitalsTracked.LCP || !('PerformanceObserver' in window)) return;
    
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry && !webVitalsTracked.LCP) {
                webVitalsTracked.LCP = true;
                track('Web Vital', {
                    metric: 'LCP',
                    value: Math.round(lastEntry.startTime),
                    rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor',
                    element: lastEntry.element?.tagName?.toLowerCase()
                });
                observer.disconnect();
            }
        });
        
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
        // LCP not supported
    }
}

/**
 * Track First Input Delay (FID) / Interaction to Next Paint (INP)
 */
export function trackFID() {
    if (webVitalsTracked.FID || !('PerformanceObserver' in window)) return;
    
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const firstInput = entries[0];
            
            if (firstInput && !webVitalsTracked.FID) {
                webVitalsTracked.FID = true;
                const delay = firstInput.processingStart - firstInput.startTime;
                track('Web Vital', {
                    metric: 'FID',
                    value: Math.round(delay),
                    rating: delay <= 100 ? 'good' : delay <= 300 ? 'needs-improvement' : 'poor',
                    eventType: firstInput.name
                });
                observer.disconnect();
            }
        });
        
        observer.observe({ type: 'first-input', buffered: true });
    } catch (e) {
        // FID not supported
    }
}

/**
 * Track Cumulative Layout Shift (CLS)
 */
export function trackCLS() {
    if (webVitalsTracked.CLS || !('PerformanceObserver' in window)) return;
    
    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries = [];
    
    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    const firstSessionEntry = sessionEntries[0];
                    const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                    
                    // Session window: 5 seconds max, 1 second gap
                    if (
                        sessionValue &&
                        entry.startTime - lastSessionEntry.startTime < 1000 &&
                        entry.startTime - firstSessionEntry.startTime < 5000
                    ) {
                        sessionValue += entry.value;
                        sessionEntries.push(entry);
                    } else {
                        sessionValue = entry.value;
                        sessionEntries = [entry];
                    }
                    
                    if (sessionValue > clsValue) {
                        clsValue = sessionValue;
                    }
                }
            }
        });
        
        observer.observe({ type: 'layout-shift', buffered: true });
        
        // Report CLS on page hide
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && !webVitalsTracked.CLS && clsValue > 0) {
                webVitalsTracked.CLS = true;
                track('Web Vital', {
                    metric: 'CLS',
                    value: clsValue.toFixed(4),
                    rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
                });
                observer.disconnect();
            }
        });
    } catch (e) {
        // CLS not supported
    }
}

/**
 * Track First Contentful Paint (FCP)
 */
export function trackFCP() {
    if (webVitalsTracked.FCP || !('PerformanceObserver' in window)) return;
    
    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcp = entries.find(e => e.name === 'first-contentful-paint');
            
            if (fcp && !webVitalsTracked.FCP) {
                webVitalsTracked.FCP = true;
                track('Web Vital', {
                    metric: 'FCP',
                    value: Math.round(fcp.startTime),
                    rating: fcp.startTime <= 1800 ? 'good' : fcp.startTime <= 3000 ? 'needs-improvement' : 'poor'
                });
                observer.disconnect();
            }
        });
        
        observer.observe({ type: 'paint', buffered: true });
    } catch (e) {
        // FCP not supported
    }
}

/**
 * Track Time to First Byte (TTFB)
 */
export function trackTTFB() {
    if (webVitalsTracked.TTFB) return;
    
    const perf = performance.getEntriesByType('navigation')[0];
    if (!perf) {
        // Wait and retry
        setTimeout(trackTTFB, 100);
        return;
    }
    
    webVitalsTracked.TTFB = true;
    const ttfb = perf.responseStart - perf.requestStart;
    
    track('Web Vital', {
        metric: 'TTFB',
        value: Math.round(ttfb),
        rating: ttfb <= 800 ? 'good' : ttfb <= 1800 ? 'needs-improvement' : 'poor'
    });
}

/**
 * Track resource loading performance
 */
export function trackResources() {
    if (!('PerformanceObserver' in window)) return;
    
    // Aggregate resource stats instead of individual resources
    setTimeout(() => {
        const resources = performance.getEntriesByType('resource');
        
        const stats = {
            total: resources.length,
            scripts: 0,
            styles: 0,
            images: 0,
            fonts: 0,
            other: 0,
            totalTransferSize: 0,
            slowResources: []
        };
        
        resources.forEach(r => {
            stats.totalTransferSize += r.transferSize || 0;
            
            if (r.initiatorType === 'script') stats.scripts++;
            else if (r.initiatorType === 'link' || r.initiatorType === 'css') stats.styles++;
            else if (r.initiatorType === 'img') stats.images++;
            else if (r.initiatorType === 'font' || r.name.match(/\.(woff2?|ttf|eot|otf)$/i)) stats.fonts++;
            else stats.other++;
            
            // Track slow resources (> 1s)
            if (r.duration > 1000 && stats.slowResources.length < 5) {
                stats.slowResources.push({
                    name: r.name.split('/').pop()?.substring(0, 50),
                    type: r.initiatorType,
                    duration: Math.round(r.duration)
                });
            }
        });
        
        track('Resource Stats', stats);
    }, 3000); // Wait for resources to load
}

/**
 * Initialize all performance tracking
 */
export function initPerformanceTracking() {
    // Track page load after it completes
    if (document.readyState === 'complete') {
        setTimeout(trackPageLoad, 0);
    } else {
        window.addEventListener('load', () => setTimeout(trackPageLoad, 0));
    }
    
    // Track Web Vitals
    trackLCP();
    trackFCP();
    trackFID();
    trackCLS();
    trackTTFB();
    
    // Track resource stats
    trackResources();
}
