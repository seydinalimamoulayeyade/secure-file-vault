const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');

// Token d'accès courte durée (1h par défaut)
const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), username: user.username, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

// Refresh token longue durée (7j par défaut)
const signRefreshToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.secret);
const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

// On ne stocke jamais le refresh token en clair : seulement son empreinte SHA-256
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
