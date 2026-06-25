const AuditLog = require('../models/AuditLog');

// Extrait l'IP réelle de la requête (derrière proxy via trust proxy).
function clientIp(req) {
  return req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
}

// Enregistre une entrée d'audit. Ne lève jamais d'erreur bloquante :
// l'audit ne doit pas faire échouer l'action métier.
async function record({ req, action, user, file, fileName, details }) {
  try {
    await AuditLog.create({
      user: user?.id || user?._id || null,
      username: user?.username || null,
      action,
      file: file?._id || file || null,
      fileName: fileName || file?.originalName || null,
      ip: req ? clientIp(req) : null,
      details: details || null,
    });
  } catch (e) {
    console.error('⚠️  Échec d\'écriture du journal d\'audit :', e.message);
  }
}

module.exports = { record, clientIp };
