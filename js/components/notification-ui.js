import { notificationService } from '../services/notification-service.js';
import { authService } from '../services/auth-service.js';

class NotificationUI {
    constructor() {
        this.init();
    }

    init() {
        this.setupNotificationPreferences();
        this.setupEventListeners();
    }

    setupNotificationPreferences() {
        // Vérifier le statut des notifications au chargement
        this.updateNotificationStatus();

        // Mettre à jour le statut quand l'utilisateur change
        authService.onAuthStateChange((user) => {
            if (user) {
                this.registerForNotifications();
            }
        });
    }

    setupEventListeners() {
        // Écouteur pour le toggle des notifications
        document.getElementById('notificationToggle')?.addEventListener('change', async (e) => {
            try {
                if (e.target.checked) {
                    await this.enableNotifications();
                } else {
                    await this.disableNotifications();
                }
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });

        // Écouteur pour le bouton de test des notifications
        document.getElementById('testNotification')?.addEventListener('click', async () => {
            try {
                await notificationService.showNotification({
                    notification: {
                        title: 'Test de notification',
                        body: 'Ceci est une notification de test',
                        icon: '/icons/icon-192x192.png',
                        data: {
                            type: 'test'
                        }
                    }
                });
                this.showMessage('Notification de test envoyée', 'success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });
    }

    async enableNotifications() {
        try {
            const user = authService.getCurrentUser();
            if (!user) throw new Error('Vous devez être connecté pour activer les notifications');

            // Demander la permission et obtenir le token
            const token = await notificationService.getNotificationToken();
            
            // Sauvegarder le token
            await notificationService.saveTokenToServer(token, user.uid);
            
            this.showMessage('Notifications activées avec succès', 'success');
            this.updateNotificationStatus();
        } catch (error) {
            throw error;
        }
    }

    async disableNotifications() {
        try {
            await notificationService.unsubscribe();
            this.showMessage('Notifications désactivées', 'success');
            this.updateNotificationStatus();
        } catch (error) {
            throw error;
        }
    }

    async registerForNotifications() {
        try {
            const toggle = document.getElementById('notificationToggle');
            if (toggle?.checked) {
                await this.enableNotifications();
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    updateNotificationStatus() {
        const toggle = document.getElementById('notificationToggle');
        const status = document.getElementById('notificationStatus');
        
        if (toggle && status) {
            const permission = Notification.permission;
            
            switch (permission) {
                case 'granted':
                    toggle.checked = true;
                    status.textContent = 'Notifications activées';
                    status.className = 'status-enabled';
                    break;
                case 'denied':
                    toggle.checked = false;
                    toggle.disabled = true;
                    status.textContent = 'Notifications bloquées par le navigateur';
                    status.className = 'status-blocked';
                    break;
                default:
                    toggle.checked = false;
                    status.textContent = 'Notifications désactivées';
                    status.className = 'status-disabled';
            }
        }
    }

    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type}`;
        messageElement.textContent = message;

        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageElement);

        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// Initialiser l'interface des notifications
export const notificationUI = new NotificationUI();
