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
    url?: string;
    referrer?: string;
    path?: string;
    title?: string;
    previousPath?: string;

    viewport?: string;
    screen?: {
      width?: number;
      height?: number;
      colorDepth?: number;
    };

    userAgent?: string;
    timezone?: string;
    language?: string;

    connection?: {
      effectiveType?: string;
      saveData?: boolean;
    };

    [key: string]: unknown;
  };
}

export type ExtendedAnalyticsEvent = AnalyticsEvent & {
  meta: {
    ip?: string;
    userAgent: string;
  };
};

