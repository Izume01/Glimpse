import { track } from "./track.js";

const customViewedElements = new WeakSet();

/**
 * Track when elements become visible in the viewport
 * @param {string|Element} selector - CSS selector or element
 * @param {string} eventName - Event name to track
 * @param {object} properties - Additional properties
 * @param {object} options - { threshold: 0.5, once: true }
 * @returns {function} - Cleanup function to stop observing
 */
function trackOnView(selector, eventName, properties = {}, options = {}) {
    const threshold = options.threshold ?? 0.5;
    const once = options.once ?? true;

    const elements = typeof selector === 'string' 
        ? document.querySelectorAll(selector) 
        : [selector];

    if (elements.length === 0) {
        console.warn(`GlimpseTracker: No elements found for selector "${selector}"`);
        return () => {};
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                
                if (once && customViewedElements.has(el)) return;
                
                customViewedElements.add(el);
                track(eventName, {
                    ...properties,
                    elementId: el.id || undefined,
                    elementTag: el.tagName.toLowerCase()
                });

                if (once) {
                    observer.unobserve(el);
                }
            }
        });
    }, { threshold });

    elements.forEach(el => observer.observe(el));

    return () => elements.forEach(el => observer.unobserve(el));
}

export default trackOnView;