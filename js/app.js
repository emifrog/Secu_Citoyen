import { authService } from './services/auth-service.js';
import { storageService } from './services/storage-service.js';
import { notificationService } from './services/notification-service.js';
import { uiController } from './components/ui-controller.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Initialiser les services
            await this.initializeServices();
            
            // Gérer l'état de l'authentification
            this.handleAuthState();
            
            // Initialiser les écouteurs d'événements
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Erreur d\'initialisation:', error);
            uiController.showMessage('Une erreur est survenue lors de l\'initialisation de l\'application', 'error');
        }
    }

    async initializeServices() {
        // Vérifier le support du Service Worker
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker enregistré avec succès:', registration);
            } catch (error) {
                console.error('Erreur d\'enregistrement du Service Worker:', error);
            }
        }

        // Initialiser les notifications si l'utilisateur est connecté
        const user = authService.getCurrentUser();
        if (user) {
            try {
                await notificationService.init();
            } catch (error) {
                console.error('Erreur d\'initialisation des notifications:', error);
            }
        }
    }

    handleAuthState() {
        // Gérer les changements d'état d'authentification
        authService.onAuthStateChange((user) => {
            const authContent = document.getElementById('authContent');
            const userContent = document.querySelectorAll('#userContent');
            const userDisplayName = document.getElementById('userDisplayName');
            const userAvatar = document.getElementById('userAvatar');

            if (user) {
                // Utilisateur connecté
                authContent?.style.setProperty('display', 'none');
                userContent.forEach(element => {
                    element.style.setProperty('display', 'flex');
                });

                // Mettre à jour les informations utilisateur
                if (userDisplayName) {
                    userDisplayName.textContent = user.displayName || user.email;
                }
                if (userAvatar && user.photoURL) {
                    userAvatar.src = user.photoURL;
                }

                // Initialiser les notifications
                notificationService.init().catch(console.error);

            } else {
                // Utilisateur déconnecté
                authContent?.style.setProperty('display', 'block');
                userContent.forEach(element => {
                    element.style.setProperty('display', 'none');
                });
            }
        });
    }

    setupEventListeners() {
        // Écouter les événements de l'application
        window.addEventListener('online', () => {
            uiController.showMessage('Connexion internet rétablie', 'success');
        });

        window.addEventListener('offline', () => {
            uiController.showMessage('Connexion internet perdue', 'error');
        });

        // Gérer l'installation de la PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Afficher un bouton d'installation personnalisé
            const installButton = document.createElement('button');
            installButton.textContent = 'Installer l\'application';
            installButton.className = 'btn btn-primary';
            installButton.addEventListener('click', () => this.installPWA());
            
            document.querySelector('.top-bar-actions')?.prepend(installButton);
        });
    }

    async installPWA() {
        if (!this.deferredPrompt) return;

        try {
            // Afficher le prompt d'installation
            const result = await this.deferredPrompt.prompt();
            console.log('Résultat de l\'installation:', result);
            
            // Réinitialiser le prompt différé
            this.deferredPrompt = null;
            
            // Masquer le bouton d'installation
            document.querySelector('.top-bar-actions button')?.remove();
        } catch (error) {
            console.error('Erreur d\'installation:', error);
            uiController.showMessage('Erreur lors de l\'installation de l\'application', 'error');
        }
    }
}

// Initialiser l'application
const app = new App();
