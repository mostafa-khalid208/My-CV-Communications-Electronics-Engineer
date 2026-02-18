const CACHE_NAME = 'mks-portfolio-v4';

// Files to cache with Cache-First strategy (static assets that rarely change)
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/scripts.js',
    '/assets/images/icon.png'
];

// Files that should NEVER be cached (always fetch fresh from network)
const NEVER_CACHE_PATTERNS = [
    /articles\.json/,
    /teachings\.json/,
    /\.json$/
];

// Install event - cache only static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .catch(err => {
                console.log('Cache install failed:', err);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Network First for JSON data, Cache First for static assets
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // Always fetch JSON files fresh from network (Network First)
    const isNeverCache = NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url));
    if (isNeverCache) {
        event.respondWith(
            fetch(event.request, { cache: 'no-store' })
                .catch(() => {
                    // If network fails, try cache as fallback
                    return caches.match(event.request);
                })
        );
        return;
    }

    // For all other requests: Cache First with network fallback
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    // Don't cache non-successful responses or non-GET requests
                    if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
                        return response;
                    }
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return response;
                });
            })
            .catch(() => {
                // Fallback for offline
                return caches.match('/index.html');
            })
    );
});
