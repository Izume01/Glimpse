# NOW WHAT TO DO

## Performance Optimization
- [ ] Implement a buffer that collects events and periodically flushes them to Postgres in batches for improved performance.
- [ ] Use a timer to flush the buffer every few seconds or when it reaches a certain size.
- [ ] Ensure that the buffer is flushed before the worker shuts down to avoid data loss.

## Frontend
- [ ] Create a frontend