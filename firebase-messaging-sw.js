importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Configuration Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyBdh1kqr0qN7L5qtDA7L1ZJsk_L6-gCExs',
    authDomain: 'secucitoyen.firebaseapp.com',
    projectId: 'secucitoyen',
    storageBucket: 'secucitoyen.firebasestorage.app',
    messagingSenderId: '645083592857',
    appId: '1:645083592857:web:7450f9e2055f4bc835e008'
});

const messaging = firebase.messaging();

// Gérer les messages en arrière-plan
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Reçu message en arrière-plan:', payload);

    const { title, body, icon } = payload.notification;

    const options = {
        body,
        icon: icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        vibrate: [100, 50, 100],
        data: payload.data || {},
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

    return self.registration.showNotification(title, options);
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Clic sur notification:', event);

    event.notification.close();

    if (event.action === 'view') {
        // Ouvrir l'application sur la page appropriée
        clients.openWindow('/');
    }
});
