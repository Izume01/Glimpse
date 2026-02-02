import enqueueEvent from "../transport/sender.js";
import { getSessionId } from "../core/session.js";
import { createEvent } from "../core/event.js";

/**
 * Track a custom event
 * @param {string} name - Event name
 * @param {object} properties - Event properties
 */
export function track(name, properties) {
    const projectId = window.GlimpseTracker?.projectId;
    if (!projectId) {
        console.warn("GlimpseTracker: missing projectId. Set data-project-id on the script tag.");
        return;
    }

    const sessionId = getSessionId();
    const event = createEvent(projectId, sessionId, name, properties);
    enqueueEvent(event);
}

/**
 * Track an event immediately (bypass buffer) - useful for unload events
 * @param {string} name - Event name  
 * @param {object} properties - Event properties
 */
export function trackNow(name, properties) {
    const projectId = window.GlimpseTracker?.projectId;
    if (!projectId) return;

    const sessionId = getSessionId();
    const event = createEvent(projectId, sessionId, name, properties);
    
    // Use sendBeacon for reliable delivery on page unload
    const endpoint = window.GlimpseTracker?.endpoint || 'http://localhost:3000/event';
    const payload = JSON.stringify(event);
    
    if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, payload);
    } else {
        // Fallback to sync XHR
        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(payload);
    }
}
