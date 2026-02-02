/**
 * Next.js integration for Glimpse Analytics
 * 
 * Supports both Pages Router and App Router
 */

'use client';

import { isBrowser } from '../core/config.js';
import { analytics, initGlimpse, track, trackPageView } from './react.js';

/**
 * Next.js App Router: Analytics component
 * 
 * @example
 * // app/layout.tsx
 * import { GlimpseAnalytics } from 'glimpse-analytics/next';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <GlimpseAnalytics projectId="your-project-id" />
 *       </body>
 *     </html>
 *   );
 * }
 */
export function GlimpseAnalytics(props) {
    // This is a template - actual React component needs React import
    // Implementation:
    /*
    'use client';
    import { usePathname } from 'next/navigation';
    import { useEffect, useRef } from 'react';
    
    export function GlimpseAnalytics({ projectId, endpoint, debug = false }) {
        const pathname = usePathname();
        const initialized = useRef(false);
        const previousPath = useRef('');
        
        useEffect(() => {
            if (!initialized.current) {
                initGlimpse({ projectId, endpoint, debug });
                initialized.current = true;
            }
        }, [projectId, endpoint, debug]);
        
        useEffect(() => {
            if (pathname && pathname !== previousPath.current) {
                trackPageView(pathname);
                previousPath.current = pathname;
            }
        }, [pathname]);
        
        return null;
    }
    */
    return null;
}

/**
 * Next.js Pages Router: Use in _app.tsx
 * 
 * @example
 * // pages/_app.tsx
 * import { useGlimpsePageViews } from 'glimpse-analytics/next';
 * 
 * export default function App({ Component, pageProps }) {
 *   useGlimpsePageViews('your-project-id');
 *   return <Component {...pageProps} />;
 * }
 */
export function useGlimpsePageViews(projectId, options = {}) {
    // Template for Pages Router hook
    // Implementation needs React and next/router:
    /*
    import { useRouter } from 'next/router';
    import { useEffect, useRef } from 'react';
    
    export function useGlimpsePageViews(projectId, options = {}) {
        const router = useRouter();
        const initialized = useRef(false);
        
        useEffect(() => {
            if (!initialized.current) {
                initGlimpse({ projectId, ...options });
                initialized.current = true;
            }
            
            const handleRouteChange = (url) => {
                trackPageView(url);
            };
            
            router.events.on('routeChangeComplete', handleRouteChange);
            return () => {
                router.events.off('routeChangeComplete', handleRouteChange);
            };
        }, [router.events, projectId, options]);
    }
    */
}

/**
 * Script component for Next.js
 * Use this if you prefer script tag approach with Next.js
 * 
 * @example
 * // app/layout.tsx
 * import { GlimpseScript } from 'glimpse-analytics/next';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <GlimpseScript projectId="your-project-id" />
 *       </body>
 *     </html>
 *   );
 * }
 */
export function GlimpseScript({ projectId, endpoint, src }) {
    // Template - needs next/script:
    /*
    import Script from 'next/script';
    
    export function GlimpseScript({ projectId, endpoint, src = '/glimpse.js' }) {
        return (
            <Script
                src={src}
                data-project-id={projectId}
                data-endpoint={endpoint}
                strategy="afterInteractive"
            />
        );
    }
    */
    return null;
}

// Re-export analytics helpers
export { analytics, track, trackPageView, initGlimpse };
export default analytics;
