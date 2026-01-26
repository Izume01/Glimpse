import { track } from "./events/track.js";
import trackOnView from "./events/trackonView.js";
const script = document.currentScript
    || document.querySelector('script[data-project-id][src*="analytics-web/index.js"]')
    || document.querySelector('script[data-project-id]');

const projectIdAttr = script ? script.getAttribute('data-project-id') : undefined;
const projectId = projectIdAttr && projectIdAttr !== 'undefined' ? projectIdAttr : undefined;

window.GlimpseTracker = {
    projectId,
    track,
    trackOnView,
};

if (projectId) {
    import('./events/auto.js')
        .then(() => console.info('GlimpseTracker: auto-tracking enabled'))
        .catch((err) => {
            console.warn('GlimpseTracker: auto-tracking failed to load', err);
        });
} else {
    console.warn('GlimpseTracker: missing data-project-id on script tag. Auto-tracking disabled.');
}