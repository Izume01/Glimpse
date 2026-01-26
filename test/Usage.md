## Glimpse `trackOnView` Usage Examples

```js
// Basic usage
tracker.trackOnView('#my-element', 'Viewed Hero Section');

// With custom properties
tracker.trackOnView('#pricing', 'Viewed Pricing', {
  section: 'pricing',
  variant: 'A'
});

// With options (threshold, once)
tracker.trackOnView('.product-card', 'Viewed Product', {
  category: 'featured'
}, { 
  threshold: 0.75,  // Fire when 75% visible (default: 0.5)
  once: true        // Only fire once per element (default: true)
});

// Works with CSS selectors for multiple elements
tracker.trackOnView('.testimonial', 'Viewed Testimonial');
```

---

**Other manual tracking examples:**

```js
analytics.track('Button Click', { id: 'signup', label: 'Sign Up Button' });
analytics.track('Custom Event', { foo: 'bar', count: 123 });
```
