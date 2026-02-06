# How to run

# chmod +x test/fire_event.sh
# ./test/fire_event.sh

ENDPOINT="http://localhost:3000/event"

echo "🚀 Firing 10 analytics events..."

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 103.21.58.42" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "page_view",
    "timestamp": 1738329600000,
    "anonymousId": "anon_f9c2e8d1-3c7b-4f4d-9a21-9c1d6a4f8a33",
    "sessionId": "sess_abcd1234",
    "userId": "user_12345",
    "traits": {
      "email": "shrey@example.com",
      "name": "Shrey"
    },
    "properties": {
      "pageType": "landing",
      "campaign": "winter_launch",
      "buttonClicked": false,
      "loadTimeMs": 842
    },
    "context": {
      "url": "https://example.com/pricing",
      "referrer": "https://google.com",
      "path": "/pricing",
      "previousPath": "/",
      "title": "Pricing - Example App",
      "viewport": "1440x900",
      "screen": {
        "width": 1920,
        "height": 1080,
        "colorDepth": 24
      },
      "userAgent": "Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0",
      "timezone": "Asia/Kolkata",
      "language": "en-IN",
      "connection": {
        "effectiveType": "4g",
        "saveData": false
      }
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 54.182.91.203" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "cta_clicked",
    "timestamp": 1738329600500,
    "anonymousId": "anon_7b1c2d3e-4f5a-6789-b012-3456789abcde",
    "sessionId": "sess_f3k9x2m7",
    "userId": "user_98765",
    "properties": { "button": "Get Started", "variant": "B" },
    "context": {
      "url": "https://example.com/pricing",
      "path": "/pricing",
      "title": "Pricing - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 88.198.45.123" \
  -H "X-Forwarded-Port: 80" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "signup_completed",
    "timestamp": 1738329601000,
    "anonymousId": "anon_1a2b3c4d-5e6f-7081-92a3-b4c5d6e7f809",
    "sessionId": "sess_k9x2m7q1",
    "userId": "user_22334",
    "traits": { "plan": "pro", "source": "email" },
    "properties": { "method": "email", "coupon": "WELCOME10" },
    "context": {
      "url": "https://example.com/signup",
      "path": "/signup",
      "title": "Sign Up - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 51.140.92.18" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "scroll_depth",
    "timestamp": 1738329602000,
    "anonymousId": "anon_5f6e7d8c-9b0a-1c2d-3e4f-5060708090ab",
    "sessionId": "sess_r4t8p2l7",
    "properties": { "depth": "75%", "direction": "down" },
    "context": {
      "url": "https://example.com/blog/launch",
      "path": "/blog/launch",
      "title": "Launch Blog - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 133.130.110.21" \
  -H "X-Forwarded-Port: 8080" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "purchase",
    "timestamp": 1738329603000,
    "anonymousId": "anon_12345678-90ab-cdef-1234-567890abcdef",
    "sessionId": "sess_5m8n2b1v",
    "userId": "user_55667",
    "properties": { "amount": 2999, "currency": "JPY", "items": 2 },
    "context": {
      "url": "https://example.com/checkout",
      "path": "/checkout",
      "title": "Checkout - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 13.54.77.9" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "session_end",
    "timestamp": 1738329604000,
    "anonymousId": "anon_0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9",
    "sessionId": "sess_d8c7b6a5",
    "properties": { "duration_sec": 412, "reason": "inactive" },
    "context": {
      "url": "https://example.com/pricing",
      "path": "/pricing",
      "title": "Pricing - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 203.0.113.9" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "page_view",
    "timestamp": 1738329605000,
    "anonymousId": "anon_9f8e7d6c-5b4a-3920-1f2e-3d4c5b6a7980",
    "sessionId": "sess_z9y8x7w6",
    "properties": { "pageType": "docs", "loadTimeMs": 512 },
    "context": {
      "url": "https://example.com/docs",
      "path": "/docs",
      "title": "Docs - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 198.51.100.22" \
  -H "X-Forwarded-Port: 80" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "cta_clicked",
    "timestamp": 1738329606000,
    "anonymousId": "anon_abc12345-6789-4def-9012-3456789abcde",
    "sessionId": "sess_q1w2e3r4",
    "properties": { "button": "Start Free Trial", "position": "hero" },
    "context": {
      "url": "https://example.com/",
      "path": "/",
      "title": "Home - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 192.0.2.44" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "video_played",
    "timestamp": 1738329607000,
    "anonymousId": "anon_0f1e2d3c-4b5a-6978-90ab-cdef12345678",
    "sessionId": "sess_h7g6f5d4",
    "properties": { "videoId": "demo_01", "position_sec": 0 },
    "context": {
      "url": "https://example.com/demo",
      "path": "/demo",
      "title": "Demo - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 145.14.145.77" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "form_submitted",
    "timestamp": 1738329608000,
    "anonymousId": "anon_31415926-5358-9793-2384-626433832795",
    "sessionId": "sess_u8i7o6p5",
    "properties": { "formId": "contact", "fields": 3 },
    "context": {
      "url": "https://example.com/contact",
      "path": "/contact",
      "title": "Contact - Example App"
    }
  }'

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 72.14.204.36" \
  -H "X-Forwarded-Port: 443" \
  -d '{
    "projectId": "proj_9f3k2a",
    "event": "error_captured",
    "timestamp": 1738329609000,
    "anonymousId": "anon_98765432-10fe-dcba-9876-543210fedcba",
    "sessionId": "sess_l0k9j8h7",
    "properties": { "message": "TypeError", "source": "ui" },
    "context": {
      "url": "https://example.com/app",
      "path": "/app",
      "title": "App - Example App"
    }
  }'

echo "10 events fired"
