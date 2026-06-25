const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    username: { type: String }, // dénormalisé pour lisibilité même si l'user est supprimé
    action: {
      type: String,
      required: true,
      enum: [
        'register',
        'login',
        'logout',
        'upload',
        'download',
        'delete',
        'permission_change',
        'download_shared',
      ],
      index: true,
    },
    file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
    fileName: { type: String, default: null },
    ip: { type: String },
    details: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
