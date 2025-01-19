import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase-config';

class NotificationService {
    constructor() {
        this.messaging = messaging;
        this.vapidKey = process.env.FIREBASE_VAPID_KEY;
        this.init();
    }

    async init() {
        try {
            // Vérifier si le navigateur supporte les notifications
            if (!('Notification' in window)) {
                throw new Error('Ce navigateur ne supporte pas les notifications desktop');
            }

            // Demander la permission si nécessaire
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            // Écouter les messages en premier plan
            onMessage(this.messaging, (payload) => {
                this.showNotification(payload);
            });
        } catch (error) {
            console.error('Erreur d\'initialisation des notifications:', error);
        }
    }

    // Obtenir le token FCM
    async getNotificationToken() {
        try {
            if (Notification.permission !== 'granted') {
                throw new Error('Permission de notification non accordée');
            }

            const token = await getToken(this.messaging, {
                vapidKey: this.vapidKey
            });

            if (!token) {
                throw new Error('Impossible d\'obtenir le token');
            }

            return token;
        } catch (error) {
            throw this.handleNotificationError(error);
        }
    }

    // Sauvegarder le token sur le serveur
    async saveTokenToServer(token, userId) {
        try {
            const response = await fetch('/api/notifications/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, userId })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement du token');
            }
        } catch (error) {
            throw this.handleNotificationError(error);
        }
    }

    // Afficher une notification
    async showNotification(payload) {
        try {
            const { title, body, icon, data } = payload.notification;

            // Créer les options de la notification
            const options = {
                body,
                icon: icon || '/icons/icon-192x192.png',
                badge: '/icons/icon-96x96.png',
                vibrate: [100, 50, 100],
                data: data || {},
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

            // Afficher la notification
            if (Notification.permission === 'granted') {
                await this.registerNotificationClick();
                new Notification(title, options);
            }
        } catch (error) {
            console.error('Erreur d\'affichage de la notification:', error);
        }
    }

    // Gérer les clics sur les notifications
    async registerNotificationClick() {
        navigator.serviceWorker.ready.then(registration => {
            registration.addEventListener('notificationclick', event => {
                event.notification.close();

                if (event.action === 'view') {
                    // Ouvrir l'application sur la page appropriée
                    clients.openWindow('/');
                }
            });
        });
    }

    // Désactiver les notifications
    async unsubscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
            }
        } catch (error) {
            throw this.handleNotificationError(error);
        }
    }

    // Gestion des erreurs de notification
    handleNotificationError(error) {
        let message = 'Une erreur est survenue avec les notifications';
        
        switch (error.code) {
            case 'messaging/permission-blocked':
                message = 'Les notifications sont bloquées par le navigateur';
                break;
            case 'messaging/notifications-blocked':
                message = 'Les notifications sont bloquées par l\'utilisateur';
                break;
            case 'messaging/invalid-registration-token':
                message = 'Token d\'enregistrement invalide';
                break;
            case 'messaging/registration-token-not-registered':
                message = 'Token d\'enregistrement non enregistré';
                break;
        }

        return new Error(message);
    }
}

export const notificationService = new NotificationService();
