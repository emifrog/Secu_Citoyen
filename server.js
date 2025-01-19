const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour la compression
app.use(compression());

// Headers de sécurité
app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        // Cache-Control pour les ressources statiques
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// Route par défaut
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Vérifier si les certificats existent
const sslPath = path.join(__dirname, 'ssl');
const certPath = path.join(sslPath, 'localhost+2.pem');
const keyPath = path.join(sslPath, 'localhost+2-key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    // Configuration HTTPS
    const httpsOptions = {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath)
    };

    // Créer le serveur HTTPS
    https.createServer(httpsOptions, app).listen(PORT, () => {
        console.log(`Serveur HTTPS démarré sur https://localhost:${PORT}`);
    });
} else {
    console.error('Certificats SSL non trouvés. Veuillez suivre les instructions dans ssl/README.md');
    console.log('Démarrage du serveur en mode non-sécurisé (HTTP)...');
    
    app.listen(PORT, () => {
        console.log(`Serveur HTTP démarré sur http://localhost:${PORT}`);
        console.log('ATTENTION: Le mode HTTP n\'est pas recommandé pour le développement des PWA');
    });
}
