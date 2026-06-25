const mongoose = require('mongoose');
const crypto = require('crypto');

const fileSchema = new mongoose.Schema(
  {
    // Nom d'origine nettoyé (affiché à l'utilisateur)
    originalName: { type: String, required: true, trim: true },
    // Nom de stockage sur disque (aléatoire, jamais celui fourni par l'utilisateur)
    storageName: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true }, // taille en clair (octets)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    visibility: {
      type: String,
      enum: ['private', 'shared', 'public'],
      default: 'private',
    },
    // Token de partage pour la visibilité "shared" (lien temporaire)
    shareToken: { type: String, default: null, index: true },
  },
  { timestamps: true }
);

// Génère un nouveau token de partage
fileSchema.methods.generateShareToken = function () {
  this.shareToken = crypto.randomBytes(24).toString('hex');
  return this.shareToken;
};

fileSchema.methods.toPublic = function () {
  return {
    id: this._id,
    originalName: this.originalName,
    mimeType: this.mimeType,
    size: this.size,
    owner: this.owner,
    visibility: this.visibility,
    shareToken: this.visibility === 'shared' ? this.shareToken : undefined,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('File', fileSchema);
