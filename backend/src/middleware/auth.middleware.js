const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');

// Vérifie le token d'accès (Authorization: Bearer <token>)
const protect = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Token manquant');

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (e) {
      throw new ApiError(401, 'Token invalide ou expiré');
    }

    req.user = { id: decoded.sub, username: decoded.username, role: decoded.role };
    next();
  } catch (err) {
    next(err);
  }
};

// Restreint l'accès à certains rôles
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Accès refusé : privilèges insuffisants'));
  }
  next();
};

module.exports = { protect, requireRole };
