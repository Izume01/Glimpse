const SESSION_ID_KEY = 'glimpse_session_id';
const SESSION_START_KEY = 'glimpse_session_start';
const SESSION_LAST_ACTIVE_KEY = 'glimpse_session_last_active';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create session ID
 * Sessions expire after 30 minutes of inactivity
 */
export function getSessionId() {
    const now = Date.now();
    let sid = sessionStorage.getItem(SESSION_ID_KEY);
    const lastActive = parseInt(sessionStorage.getItem(SESSION_LAST_ACTIVE_KEY) || '0', 10);
    
    // Check if session expired
    if (sid && lastActive && (now - lastActive > SESSION_TIMEOUT)) {
        // Session expired, create new one
        sid = null;
    }
    
    if (!sid) {
        sid = `sess_${crypto.randomUUID ? crypto.randomUUID().slice(0, 12) : Math.random().toString(36).substring(2, 15)}`;
        sessionStorage.setItem(SESSION_ID_KEY, sid);
        sessionStorage.setItem(SESSION_START_KEY, now.toString());
    }
    
    // Update last active time
    sessionStorage.setItem(SESSION_LAST_ACTIVE_KEY, now.toString());
    
    return sid;
}

/**
 * Check if this is a new session (first page view or after timeout)
 */
export function isNewSession() {
    const sid = sessionStorage.getItem(SESSION_ID_KEY);
    if (!sid) return true;
    
    const lastActive = parseInt(sessionStorage.getItem(SESSION_LAST_ACTIVE_KEY) || '0', 10);
    return lastActive && (Date.now() - lastActive > SESSION_TIMEOUT);
}

/**
 * Get session start timestamp
 */
export function getSessionStart() {
    return parseInt(sessionStorage.getItem(SESSION_START_KEY) || Date.now().toString(), 10);
}

/**
 * Get session duration in milliseconds
 */
export function getSessionDuration() {
    const start = getSessionStart();
    return Date.now() - start;
}

/**
 * Track page view count in session
 */
const PAGE_VIEW_COUNT_KEY = 'glimpse_page_view_count';

export function incrementPageViewCount() {
    const count = getPageViewCount() + 1;
    sessionStorage.setItem(PAGE_VIEW_COUNT_KEY, count.toString());
    return count;
}

export function getPageViewCount() {
    return parseInt(sessionStorage.getItem(PAGE_VIEW_COUNT_KEY) || '0', 10);
}
