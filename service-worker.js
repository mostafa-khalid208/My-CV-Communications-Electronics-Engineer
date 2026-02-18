/**
 * MKS Portfolio - Service Worker
 * Enables PWA features and offline caching
 * Strategy:
 *   - HTML, JS, CSS, JSON → Network First (always get latest updates)
 *   - Images, Fonts, CDNs  → Cache First  (rarely change, safe to cache)
 */

const CACHE_NAME = 'mks-portfolio-v5';

// Images & static assets → Cache First (rarely change)
const CACHE_FIRST_PATTERNS = [
    /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
    /\.(woff|woff2|ttf|eot)$/i,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
    /cdnjs\.cloudflare\.com/,
    /kit\.fontawesome\.com/
];

// Install event
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Install complete');
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/assets/images/icon.png'
                ]).catch(() => {});
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('Service Worker: Deleting old cache', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('Service Worker: Activate complete');
            return self.clients.claim();
        })
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = request.url;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Images, Fonts, CDNs → Cache First (safe to cache, rarely change)
    if (CACHE_FIRST_PATTERNS.some(p => p.test(url))) {
        event.respondWith(
            caches.match(request).then(cached => {
                if (cached) return cached;
                return fetch(request).then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 503 }));
            })
        );
        return;
    }

    // HTML, JS, CSS, JSON, and everything else → Network First
    // Always try network first to get latest updates when online
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => {
                // Network failed → serve from cache as offline fallback
                return caches.match(request).then(cached => {
                    if (cached) return cached;
                    // Last resort: return index.html for navigation requests
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
