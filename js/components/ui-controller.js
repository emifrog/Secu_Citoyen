class UIController {
    constructor() {
        this.init();
    }

    init() {
        this.setupThemeToggle();
        this.setupSidebar();
        this.setupDropZone();
        this.setupAuthTabs();
        this.setupSearchBar();
        this.setupQuickActions();
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Appliquer le thème initial
        this.setTheme(prefersDark.matches ? 'dark' : 'light');
        
        // Écouter le bouton de thème
        themeToggle?.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            this.setTheme(isDark ? 'light' : 'dark');
        });
        
        // Écouter les préférences système
        prefersDark.addEventListener('change', (e) => {
            this.setTheme(e.matches ? 'dark' : 'light');
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('.material-icons-round');
            if (icon) {
                icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
            }
        }
        localStorage.setItem('theme', theme);
    }

    setupSidebar() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        
        menuToggle?.addEventListener('click', () => {
            sidebar?.classList.toggle('collapsed');
        });

        // Gérer la navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // Retirer la classe active de tous les items
                navItems.forEach(i => i.classList.remove('active'));
                // Ajouter la classe active à l'item cliqué
                e.currentTarget.classList.add('active');
            });
        });
    }

    setupDropZone() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        
        if (dropZone && fileInput) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.classList.add('highlight');
                });
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.classList.remove('highlight');
                });
            });

            dropZone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length > 0) {
                    fileInput.files = files;
                    // Déclencher l'événement change pour la prévisualisation
                    fileInput.dispatchEvent(new Event('change'));
                }
            });
        }
    }

    setupAuthTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabType = tab.dataset.tab;
                
                // Mettre à jour les classes actives
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Afficher le formulaire correspondant
                if (tabType === 'login') {
                    loginForm?.style.setProperty('display', 'flex');
                    registerForm?.style.setProperty('display', 'none');
                } else {
                    loginForm?.style.setProperty('display', 'none');
                    registerForm?.style.setProperty('display', 'flex');
                }
            });
        });
    }

    setupSearchBar() {
        const searchInput = document.querySelector('.search-bar input');
        let searchTimeout;
        
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });
    }

    async handleSearch(query) {
        if (!query) return;
        
        try {
            // Implémenter la recherche ici
            console.log('Recherche:', query);
        } catch (error) {
            console.error('Erreur de recherche:', error);
        }
    }

    setupQuickActions() {
        const actionCards = document.querySelectorAll('.action-card');
        
        actionCards.forEach(card => {
            card.addEventListener('click', () => {
                const action = card.querySelector('h3')?.textContent;
                this.handleQuickAction(action);
            });
        });
    }

    handleQuickAction(action) {
        switch (action) {
            case 'Signaler un incident':
                // Implémenter la logique de signalement
                console.log('Signalement d\'incident');
                break;
            case 'Guide des premiers secours':
                // Implémenter la logique du guide
                console.log('Ouverture du guide');
                break;
            case 'Points d\'urgence':
                // Implémenter la logique des points d'urgence
                console.log('Affichage des points d\'urgence');
                break;
            default:
                console.log('Action non reconnue');
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

// Initialiser le contrôleur UI
export const uiController = new UIController();
