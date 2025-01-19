// Import des utilitaires
importScripts('/js/sw-utils.js');

const CACHE_NAME = 'secucitoyen-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/firebase-config.js',
    '/js/services/auth-service.js',
    '/js/services/storage-service.js',
    '/js/services/notification-service.js',
    '/js/components/auth-ui.js',
    '/js/components/storage-ui.js',
    '/js/components/notification-ui.js',
    '/js/components/ui-controller.js',
    '/manifest.json',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
    '/icons/google.svg',
    '/icons/default-avatar.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then((cache) => {
                return cache.addAll(STATIC_ASSETS);
            }),
            caches.open(DYNAMIC_CACHE)
        ])
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        return (
                            cacheName.startsWith('secucitoyen-') &&
                            cacheName !== CACHE_NAME &&
                            cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE
                        );
                    })
                    .map((cacheName) => {
                        return caches.delete(cacheName);
                    })
            );
        })
    );
});

// Stratégie de mise en cache
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non GET
    if (event.request.method !== 'GET') return;

    // Ignorer les requêtes Firebase et les analytics
    if (
        event.request.url.includes('firebase') ||
        event.request.url.includes('google-analytics') ||
        event.request.url.includes('googleapis')
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retourner la réponse du cache si elle existe
            if (response) {
                // Mettre à jour le cache en arrière-plan
                fetch(event.request)
                    .then((fetchResponse) => {
                        if (fetchResponse && fetchResponse.status === 200) {
                            caches.open(DYNAMIC_CACHE).then((cache) => {
                                cache.put(event.request, fetchResponse.clone());
                            });
                        }
                    })
                    .catch(() => {});
                return response;
            }

            // Sinon, faire la requête réseau
            return fetch(event.request)
                .then((fetchResponse) => {
                    // Vérifier si la réponse est valide
                    if (!fetchResponse || fetchResponse.status !== 200) {
                        return fetchResponse;
                    }

                    // Mettre en cache la nouvelle réponse
                    caches.open(DYNAMIC_CACHE).then((cache) => {
                        cache.put(event.request, fetchResponse.clone());
                    });

                    return fetchResponse;
                })
                .catch((error) => {
                    // En cas d'erreur, retourner la page hors-ligne
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_PAGE);
                    }
                    throw error;
                });
        })
    );
});

// Gérer les notifications push
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.notification.body,
        icon: data.notification.icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: data.data || {},
        actions: [
            {
                action: 'view',
                title: 'Voir',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: '/icons/icon-96x96.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.notification.title, options)
    );
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        // Ouvrir l'application sur la page appropriée
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then((clientList) => {
                if (clientList.length > 0) {
                    clientList[0].focus();
                } else {
                    clients.openWindow('/');
                }
            })
        );
    }
});

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(
            // Synchroniser les messages en attente
            syncMessages()
        );
    }
});
