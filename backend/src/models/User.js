const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Le nom d\'utilisateur est requis'],
      unique: true,
      trim: true,
      minlength: [3, 'Le nom d\'utilisateur doit faire au moins 3 caractères'],
      maxlength: [30, 'Le nom d\'utilisateur ne peut dépasser 30 caractères'],
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
      select: false, // jamais renvoyé par défaut
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    // Hash des refresh tokens valides (rotation + logout multi-sessions)
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Vue publique (sans champs sensibles)
userSchema.methods.toPublic = function () {
  return { id: this._id, username: this.username, email: this.email, role: this.role };
};

module.exports = mongoose.model('User', userSchema);
