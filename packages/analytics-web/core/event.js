// Track previous path within the session
let prevPath = sessionStorage.getItem('analytics_prev_path') || undefined;

export function createEvent(projectId, sessionId, name, properties) {
    const currentPath = location.pathname + location.search + location.hash;

    const evt = {
        projectId,
        event: name,
        timestamp: Date.now(),
        sessionId,
        properties: properties || {},
        context: {
            url: window.location.href,
            referrer: document.referrer || undefined,
            path: currentPath,
            title: document.title || undefined,
            previousPath: prevPath,

            viewport: `${window.innerWidth}x${window.innerHeight}`,
            screen: {
                width: window.screen.width,
                height: window.screen.height,
                colorDepth: window.screen.colorDepth
            },

            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

            connection: navigator.connection && {
                effectiveType: navigator.connection.effectiveType,
                saveData: navigator.connection.saveData,
            },  
        }
    };

    prevPath = currentPath;
    sessionStorage.setItem('analytics_prev_path', currentPath);

    return evt;
}

