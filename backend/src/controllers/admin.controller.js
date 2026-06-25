const File = require('../models/File');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// Pagination utilitaire (page/limit avec bornes raisonnables)
function paginate(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  return { page, limit, skip: (page - 1) * limit };
}

// GET /api/admin/files → tous les fichiers (avec owner peuplé)
const listAllFiles = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const [items, total] = await Promise.all([
      File.find().populate('owner', 'username email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      File.countDocuments(),
    ]);
    res.status(200).json({
      status: 'success',
      pagination: { page, limit, total },
      data: items.map((f) => ({ ...f.toPublic(), owner: f.owner })),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users → liste des utilisateurs
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: users.map((u) => u.toPublic()) });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/audit → journal d'audit (filtres : action, user)
const listAudit = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query);
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.user) filter.user = req.query.user;

    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(filter),
    ]);
    res.status(200).json({
      status: 'success',
      pagination: { page, limit, total },
      data: items,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listAllFiles, listUsers, listAudit };
