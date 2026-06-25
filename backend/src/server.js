require('dotenv').config();
const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');

const start = async () => {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`🔒 Secure File Vault en écoute sur le port ${config.port} (${config.env})`);
    });
  } catch (err) {
    console.error('❌ Démarrage échoué :', err.message);
    process.exit(1);
  }
};

start();
