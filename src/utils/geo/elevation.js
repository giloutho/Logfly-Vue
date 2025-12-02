import { getTileCoords, getAltitudeFromTileSync } from './terrainUtils.js';

// Cache pour stocker les tuiles en mémoire
const tileCache = new Map();

/**
 * Télécharge une tuile PNG via fetch et la met en cache (navigateur)
 */
async function downloadTile(x, y, zoom) {
    const tileKey = `${zoom}/${x}/${y}`;
    // Vérifier si la tuile est déjà en cache
    if (tileCache.has(tileKey)) {
        return tileCache.get(tileKey);
    }
    const tileUrl = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${zoom}/${x}/${y}.png`;
    try {
        const response = await fetch(tileUrl);
        if (!response.ok) {
            console.error(`Erreur lors de la récupération de la tuile ${tileKey}: HTTP ${response.status}`);
            return null;
        }
        const arrayBuffer = await response.arrayBuffer();
        const tileData = new Uint8Array(arrayBuffer);
        tileCache.set(tileKey, tileData);
        return tileData;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la tuile ${tileKey}:`, error.message);
        return null;
    }
}

/**
 * Fonction pour un seul point (compatibilité)
 */
async function getAltitude(lat, lon, zoom = 14) {
    const { x, y } = getTileCoords(lat, lon, zoom);
    const tileData = await downloadTile(x, y, zoom);
    
    if (!tileData) return null;
    
    return getAltitudeFromTileSync(tileData, lat, lon, zoom);
}

/**
 * Traite plusieurs points de manière optimisée
 * Groupe les points par tuile et télécharge chaque tuile une seule fois
 */
async function getAltitudesForPoints(points, zoom = 14) {
    console.log(`Traitement de ${points.length} points...`);
    
    // Étape 1: Grouper les points par tuile
    const pointsByTile = new Map();
    
    points.forEach((point, index) => {
        const { x, y } = getTileCoords(point.latitude, point.longitude, zoom);
        const tileKey = `${zoom}/${x}/${y}`;
        
        if (!pointsByTile.has(tileKey)) {
            pointsByTile.set(tileKey, []);
        }
        
        pointsByTile.get(tileKey).push({
            index,
            latitude: point.latitude,
            longitude: point.longitude,
            x,
            y
        });
    });
    
    console.log(`${pointsByTile.size} tuiles uniques à télécharger`);
    
    // Étape 2: Télécharger toutes les tuiles en parallèle (par lots de 20)
    const tileKeys = Array.from(pointsByTile.keys());
    const batchSize = 20;
    
    for (let i = 0; i < tileKeys.length; i += batchSize) {
        const batch = tileKeys.slice(i, i + batchSize);
        const downloadPromises = batch.map(tileKey => {
            const [z, x, y] = tileKey.split('/').map(Number);
            return downloadTile(x, y, z);
        });
        
        await Promise.all(downloadPromises);
        console.log(`Téléchargé ${Math.min(i + batchSize, tileKeys.length)}/${tileKeys.length} tuiles`);
    }
    
    // Étape 3: Extraire les altitudes pour tous les points
    const results = new Array(points.length);
    
    for (const [tileKey, tilePoints] of pointsByTile) {
        const tileData = tileCache.get(tileKey);
        
        if (!tileData) {
            // Si la tuile n'a pas pu être téléchargée, marquer les points comme null
            tilePoints.forEach(point => {
                results[point.index] = null;
            });
            continue;
        }
        
        // Traiter tous les points de cette tuile
        for (const point of tilePoints) {
            const altitude = await getAltitudeFromTileSync(tileData, point.latitude, point.longitude, zoom);
            results[point.index] = altitude;
        }
    }
    
    console.log(`Traitement terminé. Cache: ${tileCache.size} tuiles`);
    return results;
}

/**
 * Vide le cache des tuiles
 */
function clearCache() {
    tileCache.clear();
}

export { getAltitude, getAltitudesForPoints, clearCache };




