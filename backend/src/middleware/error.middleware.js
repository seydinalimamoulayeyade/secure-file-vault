const multer = require('multer');

// Gestionnaire d'erreurs global
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur interne du serveur';

  // Doublon Mongo (email/username déjà pris)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `Ce ${field} est déjà utilisé`;
  }

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  // Erreurs Multer (taille, etc.)
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Fichier trop volumineux' : err.message;
  }

  if (statusCode >= 500) console.error('❌', err);

  res.status(statusCode).json({
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
  });
};

module.exports = errorHandler;
