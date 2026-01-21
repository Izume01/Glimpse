import { EventSchema } from "../../../packages/shared/zod.schema";
import type { Context } from "hono";
import { addEventToQueue } from "../services/event.service";
import type { ExtendedAnalyticsEvent } from "../../../packages/shared/event.schema";
import getIP from "../../../packages/shared/lib/getIp";

// Parse the incomming req 
// - if valid, add to queue
// - if invalid, return 400 with error details

export const IngestionEventController = async (c: Context) => {
    let body;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ error: "Invalid JSON" }, 400);
    }

    const ip = getIP(c);
    
    const parseEventResult = EventSchema.safeParse(body)

    if (!parseEventResult.success) {
        const zodError = parseEventResult.error

        const formatedError = zodError.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
        }))

        return c.json({
            status: 'error',
            errors: formatedError
        }, 400)
    }

    // if the event is valid add to bullmq queue 

    const validEvent = parseEventResult.data

    const eventWithMetadata: ExtendedAnalyticsEvent = {
        ...validEvent,
        meta: {
            ip,
            userAgent: c.req.header('User-Agent') || 'unknown',
        }
    }

    await addEventToQueue(eventWithMetadata)

    return c.json({ status: 'accepted' }, 200)
}