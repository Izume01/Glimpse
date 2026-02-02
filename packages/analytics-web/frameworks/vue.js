/**
 * Vue.js integration for Glimpse Analytics
 * 
 * Supports Vue 3 with Composition API and Vue Router
 */

import { isBrowser } from '../core/config.js';
import { analytics, initGlimpse, track, trackPageView } from './react.js';

/**
 * Vue 3 Plugin
 * 
 * @example
 * // main.ts
 * import { createApp } from 'vue';
 * import { GlimpsePlugin } from 'glimpse-analytics/vue';
 * 
 * const app = createApp(App);
 * app.use(GlimpsePlugin, { projectId: 'your-project-id' });
 * app.mount('#app');
 */
export const GlimpsePlugin = {
    install(app, options = {}) {
        if (!isBrowser()) return;

        // Initialize SDK
        initGlimpse(options);

        // Add global properties
        app.config.globalProperties.$glimpse = analytics;

        // Provide for Composition API
        app.provide('glimpse', analytics);
    }
};

/**
 * Vue Router integration
 * 
 * @example
 * // router/index.ts
 * import { createRouter } from 'vue-router';
 * import { setupGlimpseRouter } from 'glimpse-analytics/vue';
 * 
 * const router = createRouter({ ... });
 * setupGlimpseRouter(router);
 */
export function setupGlimpseRouter(router) {
    if (!isBrowser()) return;

    router.afterEach((to, from) => {
        // Don't track initial page load (handled by auto.js)
        if (!from.name) return;

        trackPageView(to.fullPath, {
            previousPath: from.fullPath,
            routeName: to.name,
        });
    });
}

/**
 * Composable for Vue 3 Composition API
 * 
 * @example
 * <script setup>
 * import { useGlimpse } from 'glimpse-analytics/vue';
 * 
 * const { track, identify } = useGlimpse();
 * 
 * function handleClick() {
 *   track('Button Clicked', { button: 'cta' });
 * }
 * </script>
 */
export function useGlimpse() {
    return analytics;
}

/**
 * Directive for tracking element visibility
 * 
 * @example
 * <template>
 *   <div v-track-view="{ event: 'Section Viewed', props: { section: 'hero' } }">
 *     Hero Section
 *   </div>
 * </template>
 */
export const vTrackView = {
    mounted(el, binding) {
        if (!isBrowser()) return;

        const { event, props = {}, threshold = 0.5 } = binding.value || {};
        if (!event) {
            console.warn('v-track-view: event name required');
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    track(event, {
                        ...props,
                        elementId: el.id || undefined,
                    });
                    observer.disconnect();
                }
            });
        }, { threshold });

        observer.observe(el);
        el._glimpseObserver = observer;
    },

    unmounted(el) {
        if (el._glimpseObserver) {
            el._glimpseObserver.disconnect();
        }
    }
};

/**
 * Directive for tracking clicks
 * 
 * @example
 * <button v-track-click="{ event: 'CTA Clicked', props: { position: 'header' } }">
 *   Get Started
 * </button>
 */
export const vTrackClick = {
    mounted(el, binding) {
        const { event, props = {} } = binding.value || {};
        if (!event) {
            console.warn('v-track-click: event name required');
            return;
        }

        const handler = () => {
            track(event, {
                ...props,
                elementId: el.id || undefined,
                elementText: el.textContent?.substring(0, 50),
            });
        };

        el.addEventListener('click', handler);
        el._glimpseClickHandler = handler;
    },

    unmounted(el) {
        if (el._glimpseClickHandler) {
            el.removeEventListener('click', el._glimpseClickHandler);
        }
    }
};

// Re-export
export { analytics, track, trackPageView, initGlimpse };
export default GlimpsePlugin;
