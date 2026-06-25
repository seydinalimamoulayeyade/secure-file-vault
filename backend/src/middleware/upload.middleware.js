const path = require('path');
const multer = require('multer');
const config = require('../config');
const ApiError = require('../utils/ApiError');

// Nettoie un nom de fichier : retire tout composant de chemin et caractères dangereux.
// Empêche le path traversal (../) et les noms exotiques.
function sanitizeFilename(name) {
  const base = path.basename(name); // retire les segments de répertoire
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]/g, '_') // garde un jeu de caractères sûr
    .replace(/^\.+/, '') // pas de point en tête (fichiers cachés / ".." )
    .slice(0, 200);
  return cleaned || 'fichier';
}

// On garde le fichier en mémoire : il est chiffré avant écriture sur disque.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!config.allowedMimeTypes.includes(file.mimetype)) {
    return cb(new ApiError(400, `Type de fichier non autorisé : ${file.mimetype}`));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSizeBytes, files: 1 },
});

module.exports = { upload, sanitizeFilename };
