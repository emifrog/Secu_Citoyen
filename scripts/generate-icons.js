const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '..', 'icons', 'icon-source.svg');
const outputDir = path.join(__dirname, '..', 'icons');

async function generateIcons() {
    try {
        // Vérifier si le dossier icons existe, sinon le créer
        try {
            await fs.access(outputDir);
        } catch {
            await fs.mkdir(outputDir, { recursive: true });
        }

        // Générer les icônes pour chaque taille
        for (const size of sizes) {
            const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
            await sharp(inputFile)
                .resize(size, size)
                .png()
                .toFile(outputFile);
            console.log(`Généré: icon-${size}x${size}.png`);
        }

        // Générer les icônes spéciales pour les raccourcis
        const shortcutIcons = [
            { name: 'secours', size: 96 },
            { name: 'alerte', size: 96 }
        ];

        for (const icon of shortcutIcons) {
            const outputFile = path.join(outputDir, `${icon.name}-${icon.size}x${icon.size}.png`);
            await sharp(inputFile)
                .resize(icon.size, icon.size)
                .png()
                .toFile(outputFile);
            console.log(`Généré: ${icon.name}-${icon.size}x${icon.size}.png`);
        }

        console.log('Génération des icônes terminée avec succès!');
    } catch (error) {
        console.error('Erreur lors de la génération des icônes:', error);
    }
}

generateIcons();
