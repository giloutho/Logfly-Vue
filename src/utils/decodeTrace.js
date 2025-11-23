// src/utils/decodeTrace.js
// Module de décodage minimal

export default function decodeTrace(content) {
  // Exemple : retourne la longueur et un extrait du contenu
  return {
    length: content.length,
    preview: content.slice(0, 100)
  }
}
