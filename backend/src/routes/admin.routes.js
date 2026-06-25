const express = require('express');
const { listAllFiles, listUsers, listAudit } = require('../controllers/admin.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Toutes les routes admin nécessitent le rôle admin
router.use(protect, requireRole('admin'));

router.get('/files', listAllFiles);
router.get('/users', listUsers);
router.get('/audit', listAudit);

module.exports = router;
