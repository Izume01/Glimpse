const ANON_ID_KEY = 'glimpse_anonymous_id';
const USER_ID_KEY = 'glimpse_user_id';
const TRAITS_KEY = 'glimpse_traits';

/**
 * Get or create a persistent anonymous ID
 */
export function getAnonymousId() {
    let anonId = localStorage.getItem(ANON_ID_KEY);
    if (!anonId) {
        anonId = `anon_${crypto.randomUUID ? crypto.randomUUID() : generateUUID()}`;
        localStorage.setItem(ANON_ID_KEY, anonId);
    }
    return anonId;
}

/**
 * Get the current user ID (if identified)
 */
export function getUserId() {
    return localStorage.getItem(USER_ID_KEY) || undefined;
}

/**
 * Get stored user traits
 */
export function getTraits() {
    try {
        const stored = localStorage.getItem(TRAITS_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Set user identity and traits
 */
export function setIdentity(userId, traits = {}) {
    if (userId) {
        localStorage.setItem(USER_ID_KEY, userId);
    }
    
    const existingTraits = getTraits();
    const mergedTraits = { ...existingTraits, ...traits };
    localStorage.setItem(TRAITS_KEY, JSON.stringify(mergedTraits));
    
    return { userId, traits: mergedTraits };
}

/**
 * Reset identity (logout)
 */
export function resetIdentity() {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(TRAITS_KEY);
    // Keep anonymous ID - regenerate on next page load if needed
}

/**
 * Fallback UUID generator for older browsers
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
