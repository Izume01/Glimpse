const ENDPOINT = `http://localhost:3000/event`;
const BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 5000; 
const MAX_RETRIES = 3;


let eventBuffer = [];
let flushTimer = null 
let isFlushing = false;

function send(events) { 
    const payload = JSON.stringify({ events });
    let attempts = 0;

    function attemptSend() {
        attempts++;
        if (navigator.sendBeacon) {
            navigator.sendBeacon(ENDPOINT, payload);
        } else {
            // fallback to fetch
            fetch(ENDPOINT , {
                method : 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true
            }).catch((err) => {
                if (attempts < MAX_RETRIES) {
                    attemptSend();
                } else {
                    console.error('Failed to send analytics events:', err);
                }
            });
        }
    }
    attemptSend();
}

function flushBuffer() {
    if (eventBuffer.length > 0) {
        send(eventBuffer);
        eventBuffer = [];
    }
}
// \DSBFKJBDSKJFBAS JBFKSAJBF  U  HATE THISHA 