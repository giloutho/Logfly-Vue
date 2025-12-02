// terrainUtils.js

/**
 * Convertit les coordonnées latitude/longitude en coordonnées de tuile (x, y) pour un niveau de zoom donné.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {number} zoom - Niveau de zoom.
 * @returns {Object} - Coordonnées de la tuile { x, y }.
 */
function getTileCoords(lat, lon, zoom) {
// Le nombre total de tuiles dans une dimension (2^zoom)
    const n = Math.pow(2, zoom);
    
    // 1. Calculer la position X (longitude)
    // Map la longitude de -180 à 180 vers 0 à n
    // Ajoute 180 pour s'assurer que la valeur est positive, divise par 360, puis multiplie par n.
    let tileX = Math.floor(n * ((lon + 180) / 360));

    // 2. Calculer la position Y (latitude)
    // Convertir la latitude en radians
    const latRad = lat * (Math.PI / 180);
    
    // Formule de projection de Mercator pour Y
    // Calcule la coordonnée y sur l'échelle de 0 à 1 (normalisée)
    let sinLat = Math.sin(latRad);
    let normalizedY = 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI);
    
    // Map la coordonnée y normalisée de 0 à n
    let tileY = Math.floor(n * normalizedY);

    // S'assurer que les valeurs X et Y restent dans les limites [0, n-1]
    tileX = Math.min(tileX, n - 1);
    tileY = Math.min(tileY, n - 1);
    tileX = Math.max(0, tileX);
    tileY = Math.max(0, tileY);

    return {
        x: tileX,
        y: tileY,
        z: zoom
    };
}

/**
 * Extrait l'altitude à partir des données de la tuile.
 * @param {Buffer} tileData - Données de la tuile (image PNG).
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {number} zoom - Niveau de zoom.
 * @returns {Promise<number>} - Altitude en mètres.
 */
function getAltitudeFromTileSync(tileData, lat, lon, zoom) {
    // Fonctionne dans le navigateur : charge l'image PNG depuis un ArrayBuffer/Uint8Array
    return new Promise((resolve, reject) => {
        // Créer un blob à partir des données binaires
        let blob;
        if (tileData instanceof Uint8Array) {
            blob = new Blob([tileData], { type: 'image/png' });
        } else if (tileData instanceof ArrayBuffer) {
            blob = new Blob([new Uint8Array(tileData)], { type: 'image/png' });
        } else {
            reject(new Error('tileData doit être Uint8Array ou ArrayBuffer'));
            return;
        }
        const url = URL.createObjectURL(blob);
        const img = new window.Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 256, 256);
            // Calcul des coordonnées du pixel
            const n = Math.pow(2, zoom);
            const x = Math.floor((lon + 180) / 360 * n * 256) % 256;
            const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n * 256) % 256;
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            const red = pixel[0];
            const green = pixel[1];
            const blue = pixel[2];
            const altitude = (red * 256 + green + blue / 256) - 32768;
            URL.revokeObjectURL(url);
            resolve(altitude);
        };
        img.onerror = function () {
            URL.revokeObjectURL(url);
            reject(new Error('Erreur de chargement de la tuile PNG'));
        };
        img.src = url;
    });
}

/**
 * Alias pour compatibilité
 */
function getAltitudeFromTile(tileData, lat, lon, zoom) {
    return getAltitudeFromTileSync(tileData, lat, lon, zoom);
}

export { getTileCoords, getAltitudeFromTile, getAltitudeFromTileSync };
