import z, { email } from 'zod'

export const EventSchema = z.object({
    projectId : z.string(),

    event : z.string(),
    timestamp : z.number(),

    userId : z.string().optional(),
    sessionId : z.string().optional(),

    traits : z
        .object({
            email : email().optional(),
            name : z.string().optional()
        })
        .optional(),

    properties : z
        .record(z.string() , z.unknown())
        .optional(),

    context : z
        .object({
            userAgent : z.string().optional(),
            url : z.string().optional(),
            referrer : z.string().optional()
        })
        .optional()
})


export type EventType = z.infer<typeof EventSchema>