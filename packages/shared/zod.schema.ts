import z, { email } from 'zod'

export const EventSchema = z.object({
    projectId: z.string(),

    event: z.string(),
    timestamp: z.number(),


    anonymousId: z.string(),
    userId: z.string().optional(),
    sessionId: z.string(),

    traits: z
        .object({
            email: email().optional(),
            name: z.string().optional()
        })
        .optional(),

    properties: z
        .record(z.string(), z.unknown())
        .optional(),

    context: z
        .object({
            url: z.string().optional(),
            referrer: z.string().optional(),
            path: z.string().optional(),
            title: z.string().optional(),
            previousPath: z.string().optional(),

            viewport: z.string().optional(),
            screen: z
                .object({
                    width: z.number().optional(),
                    height: z.number().optional(),
                    colorDepth: z.number().optional()
                })
                .optional(),

            userAgent: z.string().optional(),
            timezone: z.string().optional(),
            language: z.string().optional(),

            connection: z
                .object({
                    effectiveType: z.string().optional(),
                    saveData: z.boolean().optional()
                })
                .optional()
        })
        .catchall(z.unknown())
        .optional()
})

export type EventType = z.infer<typeof EventSchema>

export const ExtendedEventSchema = EventSchema.extend({
    meta: z.object({
        ip: z.string().optional(),
        userAgent: z.string()
    })
})

export type ExtendedEventType = z.infer<typeof ExtendedEventSchema>