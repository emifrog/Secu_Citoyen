import { authService } from '../services/auth-service.js';

class AuthUI {
    constructor() {
        this.init();
    }

    init() {
        // Écouter l'état de l'authentification
        authService.onAuthStateChange((user) => {
            this.updateUI(user);
        });

        // Ajouter les écouteurs d'événements pour les formulaires
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Formulaire de connexion
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                await authService.loginWithEmail(email, password);
                this.showMessage('Connexion réussie', 'success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });

        // Formulaire d'inscription
        document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const displayName = document.getElementById('registerName').value;
            
            try {
                await authService.registerWithEmail(email, password, displayName);
                this.showMessage('Inscription réussie', 'success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });

        // Bouton de connexion Google
        document.getElementById('googleLogin')?.addEventListener('click', async () => {
            try {
                await authService.loginWithGoogle();
                this.showMessage('Connexion avec Google réussie', 'success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });

        // Bouton de déconnexion
        document.getElementById('logoutButton')?.addEventListener('click', async () => {
            try {
                await authService.logout();
                this.showMessage('Déconnexion réussie', 'success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });

        // Formulaire de réinitialisation du mot de passe
        document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            
            try {
                await authService.resetPassword(email);
                this.showMessage('Email de réinitialisation envoyé', 'success');
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });
    }

    updateUI(user) {
        const authContent = document.getElementById('authContent');
        const userContent = document.getElementById('userContent');
        const userDisplayName = document.getElementById('userDisplayName');

        if (user) {
            // Utilisateur connecté
            if (authContent) authContent.style.display = 'none';
            if (userContent) userContent.style.display = 'block';
            if (userDisplayName) userDisplayName.textContent = user.displayName || user.email;
        } else {
            // Utilisateur déconnecté
            if (authContent) authContent.style.display = 'block';
            if (userContent) userContent.style.display = 'none';
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

        // Faire disparaître le message après 5 secondes
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    }
}

// Initialiser l'interface d'authentification
export const authUI = new AuthUI();
