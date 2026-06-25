const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const filesRoutes = require('./routes/files.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.set('trust proxy', 1); // pour récupérer l'IP réelle derrière un proxy
app.use(helmet());
app.use(cors());
app.use(express.json());

// Limite de débit sur l'authentification (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Trop de tentatives, réessayez plus tard' },
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'secure-file-vault', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/admin', adminRoutes);

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ status: 'fail', message: `Route ${req.originalUrl} introuvable` });
});

app.use(errorHandler);

module.exports = app;
