export interface AnalyticsEvent {
  projectId: string;

  event: string;
  timestamp: number;

  anonymousId: string;
  userId?: string;
  sessionId: string;

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
    search?: string;
    hash?: string;
    previousPath?: string;
    viewport?: string | { width?: number; height?: number };
    width?: number;
    height?: number;
    colorDepth?: number;
    pixelRatio?: number;

    userAgent?: string;
    timezone?: string;
    language?: string;

    languages?: string[];
    cookiesEnabled?: boolean;
    connection?: {
      effectiveType?: string;
      saveData?: boolean;
      downlink?: number;
      rtt?: number;
    };

    touchPoints?: number;
    platform?: {
      mobile?: boolean;
      platform?: string;
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

