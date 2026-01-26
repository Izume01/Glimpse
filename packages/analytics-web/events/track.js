import enqueueEvent from "../transport/sender.js";
import { getSessionId } from "../core/session.js";
import { createEvent } from "../core/event.js";

export function track(name, properties) {
    const projectId = window.GlimpseTracker && window.GlimpseTracker.projectId;
    if (!projectId) {
        console.warn("GlimpseTracker: missing projectId. Set data-project-id on the script tag.");
        return;
    }

    const sessionId = getSessionId();
    const event = createEvent(projectId, sessionId, name, properties);
    enqueueEvent(event);
}

