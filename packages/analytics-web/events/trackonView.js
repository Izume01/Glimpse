const customViewedElements = new WeakSet();

function trackOnView(selector, eventName, properties = {}, options = {}) {
    const threshold = options.threshold ?? 0.5;
    const once = options.once ?? true;

    const elements = typeof selector === 'string' 
        ? document.querySelectorAll(selector) 
        : [selector];

    if (elements.length === 0) {
        console.warn(`GlimpseTracker: No elements found for selector "${selector}"`);
        return;
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