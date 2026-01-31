import * as Sentry from "@sentry/bun";

const Sentry_Dns = process.env.SENTRY_DNS || "__YOUR_SENTRY_DNS__";

Sentry.init({
  dsn: Sentry_Dns, 
  tracesSampleRate: 1.0, 
  sendDefaultPii: true,
});
