export interface AnalyticsEvent {
  projectId: string;

  event: string;
  timestamp: number; 

  userId?: string;
  sessionId?: string;

  traits?: {
    email?: string;
    name?: string;
  };

  properties?: Record<string, unknown>;

  context?: {
    userAgent?: string;
    url?: string;
    referrer?: string;
  };
}

export type ExtendedAnalyticsEvent = AnalyticsEvent & {
  meta: {
    ip?: string;
    userAgent: string;
  };
};
