const express = require('express');
const {
  uploadFile,
  listFiles,
  downloadFile,
  downloadShared,
  updatePermission,
  deleteFile,
} = require('../controllers/files.controller');
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = express.Router();

// Lien de partage public (avant le middleware protect)
router.get('/shared/:token', downloadShared);

// Toutes les autres routes nécessitent une authentification
router.use(protect);

router.post('/', upload.single('file'), uploadFile);
router.get('/', listFiles);
router.get('/:id/download', downloadFile);
router.patch('/:id/permission', updatePermission);
router.delete('/:id', deleteFile);

module.exports = router;
