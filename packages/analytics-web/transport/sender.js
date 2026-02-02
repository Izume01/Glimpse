/**
 * Event transport layer - batches and sends events to the server
 */

const DEFAULT_ENDPOINT = 'http://localhost:3000/event';
const BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 5000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

let eventBuffer = [];
let flushTimer = null;
let isFlushing = false;

/**
 * Get the configured endpoint
 */
function getEndpoint() {
    return window.GlimpseTracker?.endpoint || DEFAULT_ENDPOINT;
}

/**
 * Send events to the server
 */
async function send(events) {
    const endpoint = getEndpoint();
    
    for (const event of events) {
        const payload = JSON.stringify(event);
        let attempts = 0;
        
        const attemptSend = async () => {
            attempts++;
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload,
                    keepalive: true,
                    credentials: 'omit',
                    mode: 'cors'
                });
                
                if (!response.ok && attempts < MAX_RETRIES) {
                    setTimeout(attemptSend, RETRY_DELAY * attempts);
                }
            } catch (err) {
                if (attempts < MAX_RETRIES) {
                    setTimeout(attemptSend, RETRY_DELAY * attempts);
                } else {
                    console.error('GlimpseTracker: Failed to send event', err);
                }
            }
        };
        
        attemptSend();
    }
}

/**
 * Flush the event buffer
 */
function flushBuffer() {
    if (isFlushing || eventBuffer.length === 0) return;
    
    isFlushing = true;
    const eventsToSend = [...eventBuffer];
    eventBuffer = [];
    
    send(eventsToSend);
    isFlushing = false;
}

/**
 * Enqueue an event for sending
 */
function enqueueEvent(event) {
    eventBuffer.push(event);
    
    if (eventBuffer.length >= BUFFER_SIZE) {
        flushBuffer();
        if (flushTimer) {
            clearTimeout(flushTimer);
            flushTimer = null;
        }
    } else {
        if (flushTimer) clearTimeout(flushTimer);
        flushTimer = setTimeout(() => {
            flushBuffer();
            flushTimer = null;
        }, FLUSH_INTERVAL);
    }
}

/**
 * Force flush all pending events (use before page unload)
 */
function flush() {
    if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
    }
    
    if (eventBuffer.length > 0) {
        // Use sendBeacon for reliable delivery
        const endpoint = getEndpoint();
        const events = [...eventBuffer];
        eventBuffer = [];
        
        for (const event of events) {
            if (navigator.sendBeacon) {
                navigator.sendBeacon(endpoint, JSON.stringify(event));
            }
        }
    }
}

// Flush on page hide
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        flush();
    }
});

window.addEventListener('pagehide', flush);

export default enqueueEvent;
export { flush, flushBuffer };
