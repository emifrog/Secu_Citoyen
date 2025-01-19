// Utilitaires pour le Service Worker

// Vérifier si l'URL est dans la liste des ressources à mettre en cache
const isAssetRequest = (url) => {
    const assetExtensions = [
        '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
        '.woff', '.woff2', '.ttf', '.eot'
    ];
    return assetExtensions.some(ext => url.endsWith(ext));
};

// Vérifier si l'URL est une API
const isApiRequest = (url) => {
    return url.includes('/api/');
};

// Stratégie Cache First
const cacheFirst = async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open('assets-cache');
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
};

// Stratégie Network First
const networkFirst = async (request) => {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open('dynamic-cache');
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
        });
    }
};

// Mise à jour périodique du cache
const updateCache = async () => {
    const cache = await caches.open('assets-cache');
    const keys = await cache.keys();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours

    for (const request of keys) {
        const response = await cache.match(request);
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
            const cacheAge = Date.now() - new Date(dateHeader).getTime();
            if (cacheAge > maxAge) {
                try {
                    const newResponse = await fetch(request);
                    if (newResponse.ok) {
                        await cache.put(request, newResponse);
                    }
                } catch (error) {
                    console.log('Erreur lors de la mise à jour du cache:', error);
                }
            }
        }
    }
};

// Nettoyer les anciens caches
const cleanupCaches = async () => {
    const cacheKeepList = ['assets-cache', 'dynamic-cache'];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter(key => !cacheKeepList.includes(key));
    await Promise.all(cachesToDelete.map(key => caches.delete(key)));
};

// Exporter les fonctions
self.swUtils = {
    isAssetRequest,
    isApiRequest,
    cacheFirst,
    networkFirst,
    updateCache,
    cleanupCaches
};
