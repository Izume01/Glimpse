import { getAnonymousId, getUserId, getTraits } from './identity.js';

// Track previous path within the session
let prevPath = sessionStorage.getItem('glimpse_prev_path') || undefined;

/**
 * Create a fully-formed event object matching the schema
 */
export function createEvent(projectId, sessionId, name, properties = {}) {
    const currentPath = location.pathname + location.search;

    const evt = {
        projectId,
        event: name,
        timestamp: Date.now(),
        
        // Identity
        sessionId,
        anonymousId: getAnonymousId(),
        userId: getUserId(),
        traits: getTraits(),
        
        // Event data
        properties: properties || {},
        
        // Context
        context: {
            // Page info
            url: window.location.href,
            path: currentPath,
            hash: location.hash || undefined,
            title: document.title || undefined,
            referrer: document.referrer || undefined,
            previousPath: prevPath,
            
            // Device & viewport
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth,
                pixelRatio: window.devicePixelRatio || 1
            },
            
            // Browser info
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages ? [...navigator.languages] : [navigator.language],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cookiesEnabled: navigator.cookieEnabled,
            
            // Connection info
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : undefined,
            
            // Touch capability
            touchPoints: navigator.maxTouchPoints || 0,
            
            // Platform hints
            platform: navigator.userAgentData ? {
                mobile: navigator.userAgentData.mobile,
                platform: navigator.userAgentData.platform
            } : undefined
        }
    };

    prevPath = currentPath;
    sessionStorage.setItem('glimpse_prev_path', currentPath);

    return evt;
}
