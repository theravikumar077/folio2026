/**
 * Service Worker Registration & PWA Event Handlers
 * Handles SW lifecycle, update detection notifications, background sync registration,
 * and PWA install prompts.
 */

export function registerServiceWorker(onUpdateFound) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service workers are not supported by this browser.');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/service-worker.js';

    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('[SW] Registered successfully with scope:', registration.scope);

        // Detect Service Worker updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available!
                console.log('[SW] New version is available and ready to install.');
                if (onUpdateFound && typeof onUpdateFound === 'function') {
                  onUpdateFound(registration);
                }
              } else {
                // First time precached for offline use
                console.log('[SW] Content is cached for offline use.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.error('[SW] Registration failed:', error);
      });

    // Listen for controller changes to reload page when SW is updated
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

/**
 * Register Background Sync tag for contact form submission
 */
export async function requestBackgroundSync(tag = 'sync-contact-form') {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log(`[SW Sync] Background sync registered with tag '${tag}'`);
    } catch (err) {
      console.warn('[SW Sync] Background sync registration error:', err);
    }
  }
}
