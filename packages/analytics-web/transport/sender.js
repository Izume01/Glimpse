const ENDPOINT = `http://localhost:3000/event`;

const BUFFER_SIZE = 10;
const FLUSH_INTERVAL = 5000; 
const MAX_RETRIES = 3;


let eventBuffer = [];
let flushTimer = null 
let isFlushing = false;

function send(events) { 
    events.map(event => {
        const payload = JSON.stringify(event);
        let attempts = 0;
    
        function attemptSend() {
            attempts++;
            // Use fetch with no credentials for cross-origin requests
            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
                credentials: 'omit',
                mode: 'cors'
            }).catch((err) => {
                if (attempts < MAX_RETRIES) {
                    setTimeout(attemptSend, 1000 * attempts);
                } else {
                    console.error('Failed to send analytics events:', err);
                }
            });
        }
        attemptSend();
    })
}

function flushBuffer() {
    if (isFlushing || eventBuffer.length === 0) return; 

    isFlushing = true;
    const eventsToSend = [...eventBuffer]
    eventBuffer = [];

    send(eventsToSend);
    isFlushing = false;
}

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


export default enqueueEvent