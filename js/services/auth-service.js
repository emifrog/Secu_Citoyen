import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase-config';

class AuthService {
    constructor() {
        this.auth = auth;
        this.googleProvider = new GoogleAuthProvider();
    }

    // Écouter les changements d'état d'authentification
    onAuthStateChange(callback) {
        return onAuthStateChanged(this.auth, callback);
    }

    // Inscription avec email/mot de passe
    async registerWithEmail(email, password, displayName) {
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            if (displayName) {
                await updateProfile(userCredential.user, { displayName });
            }
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Connexion avec email/mot de passe
    async loginWithEmail(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Connexion avec Google
    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(this.auth, this.googleProvider);
            return result.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Déconnexion
    async logout() {
        try {
            await signOut(this.auth);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Réinitialisation du mot de passe
    async resetPassword(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    // Obtenir l'utilisateur courant
    getCurrentUser() {
        return this.auth.currentUser;
    }

    // Gestion des erreurs d'authentification
    handleAuthError(error) {
        let message = 'Une erreur est survenue';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Cette adresse email est déjà utilisée';
                break;
            case 'auth/invalid-email':
                message = 'Adresse email invalide';
                break;
            case 'auth/operation-not-allowed':
                message = 'Opération non autorisée';
                break;
            case 'auth/weak-password':
                message = 'Le mot de passe est trop faible';
                break;
            case 'auth/user-disabled':
                message = 'Ce compte a été désactivé';
                break;
            case 'auth/user-not-found':
                message = 'Utilisateur non trouvé';
                break;
            case 'auth/wrong-password':
                message = 'Mot de passe incorrect';
                break;
            case 'auth/too-many-requests':
                message = 'Trop de tentatives, veuillez réessayer plus tard';
                break;
        }
        return new Error(message);
    }
}

export const authService = new AuthService();
