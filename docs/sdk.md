# Client SDK (Setup + API)

This doc only lists the client-side APIs a user actually calls (like `track`, `identify`, etc).

## APIs used in the demo HTML

These are the functions referenced in the demo page:

- `track(name, properties?)`
- `identify(userId, traits?)`
- `setTraits(traits)`
- `reset()`
- `trackOnView(selector, eventName, properties?, options?)`
- `getSessionId()`
- `getAnonymousId()`
- `getUserId()`


```html
<script
  type="module"
  src="path/to/analytics-web/index.js"
  data-project-id="your_project_id"
  data-endpoint="http://localhost:3000/event"
  data-auto-track="true"
  data-debug="false"
></script>
```

```html
<script type="module">
  const tracker = window.GlimpseTracker;

  tracker.identify('user_123', { email: 'a@b.com' });
  tracker.track('CTA Clicked', { position: 'header' });
</script>
```

## Setup (Script Tag)

Use this if you want a simple, no-build setup.

```html
<script
  type="module"
  src="path/to/analytics-web/index.js"
  data-project-id="your_project_id"
  data-endpoint="http://localhost:3000/event"
  data-auto-track="true"
  data-debug="false"
></script>
```

Once loaded, the global object is `window.GlimpseTracker`.

### Example: Script Tag Usage

```html
<script type="module">
  const tracker = window.GlimpseTracker;

  // Identify user
  tracker.identify('user_123', { email: 'a@b.com', plan: 'pro' });

  // Track custom events
  tracker.track('CTA Clicked', { position: 'header', buttonText: 'Sign Up' });

  // Get session info
  console.log('Session ID:', tracker.getSessionId());
  console.log('User ID:', tracker.getUserId());
  console.log('Anonymous ID:', tracker.getAnonymousId());

  // Update traits
  tracker.setTraits({ lastLogin: new Date().toISOString() });

  // Track element visibility
  const cleanup = tracker.trackOnView('.premium-banner', 'Premium Section Viewed', { section: 'homepage' });

  // Reset user session
  tracker.reset();
</script>
```

## Setup (Module Import)

Use this if you have a build setup and want to import the module.

```javascript
import {
  initGlimpse,
  track,
  identify,
  setTraits,
  reset,
  trackOnView,
  getSessionId,
  getAnonymousId,
  getUserId
} from '@selz979/analytics-web';

await initGlimpse({
  projectId: 'your_project_id',
  endpoint: 'http://localhost:3000/event',
  autoTrack: true,
  debug: false
});
```

### Example: Module Import Usage

```javascript
// Identify a user
await identify('user_456', { 
  email: 'user@example.com', 
  signupDate: '2024-01-15',
  company: 'Acme Corp'
});

// Track events
track('Page Viewed', { page: '/pricing', section: 'enterprise' });
track('CTA Clicked', { buttonId: 'checkout-btn', value: 99.99 });

// Update user traits
setTraits({ 
  lastSeen: new Date().toISOString(),
  plan: 'enterprise' 
});

// Track when elements become visible
const stopTracking = trackOnView(
  '.feature-card',
  'Feature Card Viewed',
  { featureId: 'ai-analytics' },
  { threshold: 0.75 }
);

// Get identifiers
console.log('Session:', getSessionId());
console.log('User:', getUserId());

// Reset to anonymous
reset();
```

## API Reference (User-Facing)

### `initGlimpse(options)`

Initializes the SDK.

**Options:**
- `projectId` (string, **required**) - Your Glimpse project ID
- `endpoint` (string, optional) - Custom event endpoint URL
- `autoTrack` (boolean, default `true`) - Enable automatic page tracking
- `debug` (boolean, default `false`) - Enable debug logging

---

### `track(name, properties?)`

Tracks a custom event.

**Example:**
```javascript
track('Purchase Completed', { 
  orderId: '12345',
  amount: 99.99,
  currency: 'USD'
});
```

---

### `identify(userId, traits?)`

Associates events with a known user.

**Example:**
```javascript
identify('user_789', { 
  email: 'john@example.com',
  firstName: 'John',
  subscription: 'premium'
});
```

---

### `setTraits(traits)`

Updates user traits without changing the user ID.

**Example:**
```javascript
setTraits({ 
  plan: 'enterprise',
  usageCount: 150,
  lastActive: new Date().toISOString()
});
```

---

### `reset()`

Clears identity and returns to anonymous state.

**Example:**
```javascript
reset(); // User becomes anonymous again
```

---

### `trackOnView(selector, eventName, properties?, options?)`

Tracks when an element becomes visible in the viewport.

**Options:**
- `threshold` (number, default `0.5`) - Visibility threshold (0-1)

**Returns:** cleanup function

**Example:**
```javascript
const cleanup = trackOnView(
  '.pricing-table',
  'Pricing Viewed',
  { plan: 'enterprise' },
  { threshold: 0.5 }
);

// Stop tracking when no longer needed
cleanup();
```

---

### `getSessionId()`

Returns current session ID.

**Example:**
```javascript
const sessionId = getSessionId();
```

---

### `getAnonymousId()`

Returns the anonymous visitor ID.

**Example:**
```javascript
const anonId = getAnonymousId();
```

---

### `getUserId()`

Returns current identified user ID or `null`.

**Example:**
```javascript
const userId = getUserId(); // 'user_123' or null
```