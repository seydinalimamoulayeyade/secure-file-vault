const crypto = require('crypto');
const config = require('../config');

// Chiffrement symétrique AES-256-GCM.
// Format du fichier chiffré sur disque : [IV(12)] [AuthTag(16)] [Ciphertext...]
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // recommandé pour GCM
const TAG_LENGTH = 16;

// Récupère la clé (32 octets) depuis la config hexadécimale, avec validation stricte.
function getKey() {
  const hex = config.encryptionKeyHex;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'FILE_ENCRYPTION_KEY invalide : 64 caractères hexadécimaux attendus (32 octets)'
    );
  }
  return Buffer.from(hex, 'hex');
}

// Chiffre un buffer en clair → buffer chiffré (IV + tag + données)
function encrypt(plainBuffer) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

// Déchiffre un buffer (IV + tag + données) → buffer en clair
function decrypt(encBuffer) {
  const iv = encBuffer.subarray(0, IV_LENGTH);
  const tag = encBuffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const data = encBuffer.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

module.exports = { encrypt, decrypt };
