// Configuration centralisée — lit les variables d'environnement.
const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-file-vault',

  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Clé AES-256 (32 octets) attendue en hexadécimal (64 caractères)
  encryptionKeyHex: process.env.FILE_ENCRYPTION_KEY || '',

  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeBytes: Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024,

  // Types MIME autorisés (pas d'exécutables)
  allowedMimeTypes: [
    'application/pdf',
    'text/plain',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'image/png',
    'image/jpeg',
  ],
};

module.exports = config;
