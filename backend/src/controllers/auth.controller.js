const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/token');

// Émet une paire access + refresh et persiste l'empreinte du refresh token
const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokens.push(hashToken(refreshToken));
  await user.save();
  return { accessToken, refreshToken };
};

// POST /auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new ApiError(400, 'username, email et password sont requis');
    }
    const user = await User.create({ username, email, password });
    res.status(201).json({ status: 'success', data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw new ApiError(400, 'username et password sont requis');
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username.toLowerCase() }],
    }).select('+password +refreshTokens');

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Identifiants invalides');
    }

    const { accessToken, refreshToken } = await issueTokens(user);
    res.status(200).json({ status: 'success', accessToken, refreshToken, data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

// POST /auth/refresh  { refreshToken }
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new ApiError(400, 'refreshToken requis');

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new ApiError(401, 'Refresh token invalide ou expiré');
    }

    const user = await User.findById(decoded.sub).select('+refreshTokens');
    const tokenHash = hashToken(refreshToken);
    if (!user || !user.refreshTokens.includes(tokenHash)) {
      throw new ApiError(401, 'Refresh token révoqué');
    }

    // Rotation : on retire l'ancien et on émet une nouvelle paire
    user.refreshTokens = user.refreshTokens.filter((h) => h !== tokenHash);
    const { accessToken, refreshToken: newRefresh } = await issueTokens(user);

    res.status(200).json({ status: 'success', accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout  { refreshToken }
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { refreshTokens: tokenHash } }
      );
    }
    res.status(200).json({ status: 'success', message: 'Déconnecté' });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me  (protégé)
const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw new ApiError(404, 'Utilisateur introuvable');
    res.status(200).json({ status: 'success', data: user.toPublic() });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, refresh, logout, me };
