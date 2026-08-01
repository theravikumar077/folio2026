/**
 * Service Worker for Ravi Kumar Portfolio PWA
 * Provides full offline capabilities, intelligent caching strategies,
 * background sync for contact form submissions, and deployment update handling.
 */

// Cache Versioning Identifier - automatically invalidates old caches on new deployment
const CACHE_VERSION = 'folio-v1.0.0';

// Distinct Cache Storage Keys for optimized lifecycle management
const CACHE_NAMES = {
  STATIC: `static-${CACHE_VERSION}`,
  DYNAMIC: `dynamic-${CACHE_VERSION}`,
  IMAGES: `images-${CACHE_VERSION}`,
  FONTS: `fonts-${CACHE_VERSION}`,
  MODELS: `models-${CACHE_VERSION}`,
  APIS: `apis-${CACHE_VERSION}`
};

// Static Core Assets to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/images/rav.jpg',
  '/images/sujalDevPic.jpg',
  '/assets/projects/alumni.png',
  '/assets/projects/lms.png',
  '/assets/projects/nexus.png',
  '/assets/projects/notes.png',
  '/assets/projects/rudee.png',
  '/models/Planet.glb',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/maskable-icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/icon.svg'
];

/**
 * 1. INSTALL EVENT
 * Precaches core application shell, static assets, 3D model, and offline page.
 */
self.addEventListener('install', (event) => {
  // Force active service worker to become active instantly if requested
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAMES.STATIC)
      .then((cache) => {
        console.log('[SW] Precaching Core Static Assets & Shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Precache failed during install:', error);
      })
  );
});

/**
 * 2. ACTIVATE EVENT
 * Automatically cleans up old caches from previous deployments.
 */
self.addEventListener('activate', (event) => {
  const currentCacheList = Object.values(CACHE_NAMES);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that is not part of the current deployment version
          if (!currentCacheList.includes(cacheName)) {
            console.log('[SW] Automatically deleting legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients for active service worker');
      return self.clients.claim();
    })
  );
});

/**
 * Helper: Identify Request Categories
 */
function isImageRequest(request) {
  return request.destination === 'image' || 
         request.url.match(/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i);
}

function isFontRequest(request) {
  return request.destination === 'font' || 
         request.url.match(/\.(woff|woff2|eot|ttf|otf)$/i) ||
         request.url.includes('fonts.googleapis.com') ||
         request.url.includes('fonts.gstatic.com');
}

function isModelRequest(request) {
  return request.url.endsWith('.glb') || 
         request.url.endsWith('.gltf') || 
         request.url.includes('/models/');
}

function isApiRequest(request) {
  return request.url.includes('/api/') || 
         request.method !== 'GET';
}

/**
 * 3. FETCH EVENT & CACHING STRATEGIES
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests (e.g. POST form submits handled via JS/IndexedDB sync)
  if (request.method !== 'GET') {
    return;
  }

  // Handle HTML Page Navigations (Network First with Offline Fallback to offline.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Dynamically store working HTML in static cache
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAMES.STATIC).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network is down, attempt to return cached page or offline.html
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const indexCached = await caches.match('/index.html');
          if (indexCached) {
            return indexCached;
          }
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Strategy A: 3D Models Cache First
  if (isModelRequest(request)) {
    event.respondWith(
      caches.open(CACHE_NAMES.MODELS).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.warn('[SW] Model fetch failed, checking secondary caches', error);
          return caches.match(request);
        }
      })
    );
    return;
  }

  // Strategy B: Images Cache First
  if (isImageRequest(request)) {
    event.respondWith(
      caches.open(CACHE_NAMES.IMAGES).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          console.warn('[SW] Image fetch offline fallback:', request.url);
          return caches.match('/icons/icon-192x192.png');
        }
      })
    );
    return;
  }

  // Strategy C: Fonts Cache First
  if (isFontRequest(request)) {
    event.respondWith(
      caches.open(CACHE_NAMES.FONTS).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return new Response('', { status: 404, statusText: 'Font unavailable offline' });
        }
      })
    );
    return;
  }

  // Strategy D: API Calls Network First with Offline Fallback
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAMES.APIS).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedApiResponse = await caches.match(request);
          if (cachedApiResponse) {
            return cachedApiResponse;
          }
          return new Response(
            JSON.stringify({ offline: true, message: "You are currently offline. Data cached previously." }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Strategy E: Static JS/CSS Assets Cache First with Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAMES.STATIC).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Suppress network errors when serving from cache
      });

      return cachedResponse || fetchPromise;
    })
  );
});

/**
 * 4. BACKGROUND SYNC EVENT
 * Triggered automatically when device regains connectivity to process queued offline contact forms.
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync triggered:', event.tag);
  if (event.tag === 'sync-contact-form') {
    event.waitUntil(
      // Broadcast message to open clients to trigger IndexedDB queue sync
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'SYNC_OFFLINE_CONTACTS' });
        });
      })
    );
  }
});

/**
 * 5. MESSAGE LISTENER
 * Listens for UI instructions (e.g. skipWaiting for update notification).
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Executing skipWaiting on command from client');
    self.skipWaiting();
  }
});
