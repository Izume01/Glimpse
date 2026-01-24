# How to run 

# chmod +x test/fire_event.sh
# ./test/fire_event.sh

ENDPOINT="http://localhost:3000/event"

echo "🚀 Firing analytics events..."

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 103.21.58.42" \
  -d '{
    "projectId": "proj_123",
    "event": "page_view",
    "timestamp": 1706000200000,
    "sessionId": "sess_ind_1",
    "context": { "url": "https://example.com/" }
  }' &

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 54.182.91.203" \
  -d '{
    "projectId": "proj_123",
    "event": "cta_clicked",
    "timestamp": 1706000201000,
    "sessionId": "sess_us_1",
    "userId": "user_us_7",
    "properties": { "button": "Get Started" }
  }' &

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 88.198.45.123" \
  -d '{
    "projectId": "proj_123",
    "event": "signup_completed",
    "timestamp": 1706000202000,
    "sessionId": "sess_de_1",
    "userId": "user_de_3"
  }' &

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 51.140.92.18" \
  -d '{
    "projectId": "proj_123",
    "event": "scroll_depth",
    "timestamp": 1706000203000,
    "sessionId": "sess_uk_1",
    "properties": { "depth": "75%" }
  }' &

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 133.130.110.21" \
  -d '{
    "projectId": "proj_123",
    "event": "purchase",
    "timestamp": 1706000204000,
    "sessionId": "sess_jp_1",
    "properties": { "amount": 2999, "currency": "JPY" }
  }' &

curl -s -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -H "X-Forwarded-For: 13.54.77.9" \
  -d '{
    "projectId": "proj_123",
    "event": "session_end",
    "timestamp": 1706000205000,
    "sessionId": "sess_au_1",
    "properties": { "duration_sec": 412 }
  }' &

wait
echo "All events fired"
