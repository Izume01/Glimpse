# NOW WHAT TO DO

## Performance Optimization
- [ ] Implement a buffer that collects events and periodically flushes them to Postgres in batches for improved performance.
- [ ] Use a timer to flush the buffer every few seconds or when it reaches a certain size.
- [ ] Ensure that the buffer is flushed before the worker shuts down to avoid data loss.

## Frontend
- [ ] Create a frontend

## Client Library
- []  Rate limiting (prevents abuse) [1000 events / minute / siteId]
- [] Backend:

if (!validSite(siteId)) reject();
- []  Validate events against a schema interface for visualizing the collected events in real-time.
- [] Implement filtering and sorting options to help users analyze the data effectively.
- [] Design a user-friendly interface that displays key metrics and insights derived from the event data.
