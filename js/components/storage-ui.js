import { storageService } from '../services/storage-service.js';
import { authService } from '../services/auth-service.js';

class StorageUI {
    constructor() {
        this.init();
    }

    init() {
        this.setupUploadListeners();
        this.setupGalleryListeners();
    }

    setupUploadListeners() {
        // Écouteur pour le formulaire d'upload d'images
        document.getElementById('uploadForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            
            if (!file) {
                this.showMessage('Veuillez sélectionner un fichier', 'error');
                return;
            }

            try {
                const user = authService.getCurrentUser();
                if (!user) throw new Error('Vous devez être connecté pour uploader des fichiers');

                const path = `users/${user.uid}/images/${Date.now()}_${file.name}`;
                const result = await storageService.uploadImage(file, path, {
                    maxWidth: 1920,
                    maxHeight: 1080,
                    quality: 0.8
                });

                this.showMessage('Image téléchargée avec succès', 'success');
                this.addImageToGallery(result);
                fileInput.value = '';
            } catch (error) {
                this.showMessage(error.message, 'error');
            }
        });

        // Prévisualisation de l'image
        document.getElementById('fileInput')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    setupGalleryListeners() {
        // Charger les images au chargement de la page
        this.loadGallery();

        // Écouteur pour la suppression d'images
        document.getElementById('gallery')?.addEventListener('click', async (e) => {
            if (e.target.classList.contains('delete-image')) {
                const imagePath = e.target.dataset.path;
                if (imagePath) {
                    try {
                        await storageService.deleteFile(imagePath);
                        e.target.closest('.gallery-item').remove();
                        this.showMessage('Image supprimée avec succès', 'success');
                    } catch (error) {
                        this.showMessage(error.message, 'error');
                    }
                }
            }
        });
    }

    async loadGallery() {
        try {
            const user = authService.getCurrentUser();
            if (!user) return;

            const gallery = document.getElementById('gallery');
            if (!gallery) return;

            const path = `users/${user.uid}/images`;
            const files = await storageService.listFiles(path);
            
            gallery.innerHTML = '';
            files.forEach(file => this.addImageToGallery(file));
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    addImageToGallery(file) {
        const gallery = document.getElementById('gallery');
        if (!gallery) return;

        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
            <img src="${file.url}" alt="${file.name}" loading="lazy">
            <div class="gallery-item-overlay">
                <button class="delete-image" data-path="${file.path}">
                    Supprimer
                </button>
            </div>
        `;
        gallery.appendChild(item);
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

// Initialiser l'interface de stockage
export const storageUI = new StorageUI();
