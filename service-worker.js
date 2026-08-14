/**
 * MKS Portfolio - Service Worker v8
 * Enables PWA features and offline caching with smooth background updates
 */

const CACHE_NAME = 'mks-portfolio-v8';

// Static assets to pre-cache
const PRECACHE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './scripts.js',
    './articles-manager.js',
    './articles-summary.json',
    './assets/images/icon.png'
];

// Images & static assets patterns
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
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_ASSETS).catch(() => {}))
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
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
                    if (response && response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 503 }));
            })
        );
        return;
    }

    // HTML, JS, CSS, JSON → Stale-While-Revalidate / Network First
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response && response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(request).then(cached => {
                    if (cached) return cached;
                    if (request.mode === 'navigate') {
                        return caches.match('./index.html') || caches.match('/');
                    }
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
