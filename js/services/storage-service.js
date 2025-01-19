import {
    ref,
    uploadBytes,
    getDownloadURL,
    listAll,
    deleteObject
} from 'firebase/storage';
import { storage } from '../firebase-config';

class StorageService {
    constructor() {
        this.storage = storage;
    }

    // Télécharger un fichier
    async uploadFile(file, path) {
        try {
            const storageRef = ref(this.storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return {
                url: downloadURL,
                path: snapshot.ref.fullPath,
                name: snapshot.ref.name
            };
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Télécharger une image avec compression
    async uploadImage(file, path, options = {}) {
        try {
            // Vérifier si c'est une image
            if (!file.type.startsWith('image/')) {
                throw new Error('Le fichier doit être une image');
            }

            // Compresser l'image si nécessaire
            const compressedFile = await this.compressImage(file, options);
            return await this.uploadFile(compressedFile, path);
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Obtenir l'URL de téléchargement d'un fichier
    async getFileUrl(path) {
        try {
            const fileRef = ref(this.storage, path);
            return await getDownloadURL(fileRef);
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Lister les fichiers dans un dossier
    async listFiles(path) {
        try {
            const folderRef = ref(this.storage, path);
            const result = await listAll(folderRef);
            const files = await Promise.all(
                result.items.map(async (itemRef) => {
                    const url = await getDownloadURL(itemRef);
                    return {
                        name: itemRef.name,
                        path: itemRef.fullPath,
                        url
                    };
                })
            );
            return files;
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Supprimer un fichier
    async deleteFile(path) {
        try {
            const fileRef = ref(this.storage, path);
            await deleteObject(fileRef);
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Compresser une image
    async compressImage(file, options = {}) {
        return new Promise((resolve, reject) => {
            const {
                maxWidth = 1920,
                maxHeight = 1080,
                quality = 0.8
            } = options;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculer les nouvelles dimensions
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir en Blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                // Créer un nouveau fichier avec le même nom
                                const compressedFile = new File([blob], file.name, {
                                    type: 'image/jpeg',
                                    lastModified: Date.now()
                                });
                                resolve(compressedFile);
                            } else {
                                reject(new Error('Échec de la compression de l\'image'));
                            }
                        },
                        'image/jpeg',
                        quality
                    );
                };
                img.onerror = () => {
                    reject(new Error('Échec du chargement de l\'image'));
                };
            };
            reader.onerror = () => {
                reject(new Error('Échec de la lecture du fichier'));
            };
        });
    }

    // Gestion des erreurs de stockage
    handleStorageError(error) {
        let message = 'Une erreur est survenue lors de l\'opération de stockage';
        switch (error.code) {
            case 'storage/unauthorized':
                message = 'Vous n\'êtes pas autorisé à effectuer cette opération';
                break;
            case 'storage/canceled':
                message = 'Opération annulée';
                break;
            case 'storage/unknown':
                message = 'Une erreur inconnue est survenue';
                break;
            case 'storage/object-not-found':
                message = 'Fichier non trouvé';
                break;
            case 'storage/bucket-not-found':
                message = 'Bucket de stockage non trouvé';
                break;
            case 'storage/quota-exceeded':
                message = 'Quota de stockage dépassé';
                break;
            case 'storage/invalid-checksum':
                message = 'Le fichier est corrompu';
                break;
            case 'storage/retry-limit-exceeded':
                message = 'Nombre maximal de tentatives dépassé';
                break;
        }
        return new Error(message);
    }
}

export const storageService = new StorageService();
