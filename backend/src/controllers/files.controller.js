const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const File = require('../models/File');
const ApiError = require('../utils/ApiError');
const cryptoService = require('../services/crypto.service');
const audit = require('../services/audit.service');
const { sanitizeFilename } = require('../middleware/upload.middleware');
const config = require('../config');

const uploadDir = path.isAbsolute(config.uploadDir)
  ? config.uploadDir
  : path.join(__dirname, '..', '..', config.uploadDir);

async function ensureUploadDir() {
  await fs.mkdir(uploadDir, { recursive: true });
}

const isAdmin = (req) => req.user.role === 'admin';
const isOwner = (file, req) => file.owner.toString() === req.user.id;

// Détermine si l'utilisateur courant peut lire le fichier
function canRead(file, req) {
  if (isAdmin(req) || isOwner(file, req)) return true;
  if (file.visibility === 'public') return true;
  return false; // private/shared non possédé → refusé (le partage passe par /shared/:token)
}

// POST /api/files  (multipart : champ "file")
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'Aucun fichier fourni (champ "file")');

    await ensureUploadDir();

    const originalName = sanitizeFilename(req.file.originalname);
    const storageName = `${crypto.randomBytes(16).toString('hex')}.enc`;

    // Chiffrement AES-256 avant écriture sur disque
    const encrypted = cryptoService.encrypt(req.file.buffer);
    await fs.writeFile(path.join(uploadDir, storageName), encrypted);

    const file = await File.create({
      originalName,
      storageName,
      mimeType: req.file.mimetype,
      size: req.file.size,
      owner: req.user.id,
      visibility: 'private',
    });

    await audit.record({ req, action: 'upload', user: req.user, file });
    res.status(201).json({ status: 'success', data: file.toPublic() });
  } catch (err) {
    next(err);
  }
};

// GET /api/files  → fichiers visibles par l'utilisateur (les siens + publics)
const listFiles = async (req, res, next) => {
  try {
    const query = isAdmin(req)
      ? {}
      : { $or: [{ owner: req.user.id }, { visibility: 'public' }] };
    const files = await File.find(query).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: files.map((f) => f.toPublic()) });
  } catch (err) {
    next(err);
  }
};

// Lit + déchiffre un fichier et le renvoie en flux
async function streamDecrypted(file, res) {
  const encrypted = await fs.readFile(path.join(uploadDir, file.storageName));
  const plain = cryptoService.decrypt(encrypted);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
  res.send(plain);
}

// GET /api/files/:id/download  (protégé)
const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) throw new ApiError(404, 'Fichier introuvable');
    if (!canRead(file, req)) throw new ApiError(403, 'Accès refusé');

    await audit.record({ req, action: 'download', user: req.user, file });
    await streamDecrypted(file, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/files/shared/:token  (public, via lien de partage)
const downloadShared = async (req, res, next) => {
  try {
    const file = await File.findOne({ shareToken: req.params.token, visibility: 'shared' });
    if (!file) throw new ApiError(404, 'Lien de partage invalide ou expiré');

    await audit.record({ req, action: 'download_shared', file, details: 'via lien partagé' });
    await streamDecrypted(file, res);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/files/:id/permission  { visibility }  (protégé, owner ou admin)
const updatePermission = async (req, res, next) => {
  try {
    const { visibility } = req.body;
    if (!['private', 'shared', 'public'].includes(visibility)) {
      throw new ApiError(400, 'visibility doit être private, shared ou public');
    }

    const file = await File.findById(req.params.id);
    if (!file) throw new ApiError(404, 'Fichier introuvable');
    if (!isOwner(file, req) && !isAdmin(req)) throw new ApiError(403, 'Accès refusé');

    file.visibility = visibility;
    if (visibility === 'shared') {
      if (!file.shareToken) file.generateShareToken();
    } else {
      file.shareToken = null;
    }
    await file.save();

    await audit.record({
      req,
      action: 'permission_change',
      user: req.user,
      file,
      details: `→ ${visibility}`,
    });
    res.status(200).json({ status: 'success', data: file.toPublic() });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/files/:id  (protégé, owner ou admin)
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) throw new ApiError(404, 'Fichier introuvable');
    if (!isOwner(file, req) && !isAdmin(req)) throw new ApiError(403, 'Accès refusé');

    await fs.unlink(path.join(uploadDir, file.storageName)).catch(() => {});
    await file.deleteOne();

    await audit.record({
      req,
      action: 'delete',
      user: req.user,
      fileName: file.originalName,
      details: file._id.toString(),
    });
    res.status(200).json({ status: 'success', message: 'Fichier supprimé' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadFile,
  listFiles,
  downloadFile,
  downloadShared,
  updatePermission,
  deleteFile,
};
