import { setIdentity, resetIdentity, getAnonymousId, getUserId, getTraits } from "../core/identity.js";
import { track } from "./track.js";

/**
 * Identify a user with a unique ID and optional traits
 * @param {string} userId - Unique user identifier
 * @param {object} traits - User traits (name, email, plan, etc.)
 */
export function identify(userId, traits = {}) {
    const previousUserId = getUserId();
    const result = setIdentity(userId, traits);
    
    // Track the identify event
    track('User Identified', {
        userId: result.userId,
        traits: result.traits,
        previousUserId: previousUserId || undefined,
        isNewIdentity: !previousUserId
    });
    
    return result;
}

/**
 * Add or update user traits without changing userId
 * @param {object} traits - User traits to merge
 */
export function setTraits(traits = {}) {
    const userId = getUserId();
    return setIdentity(userId, traits);
}

/**
 * Reset user identity (for logout)
 */
export function reset() {
    const previousUserId = getUserId();
    const anonymousId = getAnonymousId();
    
    resetIdentity();
    
    track('User Reset', {
        previousUserId,
        anonymousId
    });
}

/**
 * Alias: Link anonymous ID to a user ID (for signup flows)
 * @param {string} newUserId - The new user ID to link
 */
export function alias(newUserId) {
    const anonymousId = getAnonymousId();
    const previousUserId = getUserId();
    
    track('User Alias', {
        anonymousId,
        previousUserId,
        newUserId
    });
    
    return identify(newUserId);
}
