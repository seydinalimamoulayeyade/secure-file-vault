const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  if (!config.mongoUri) throw new Error('MONGODB_URI manquant dans les variables d\'environnement');
  await mongoose.connect(config.mongoUri);
  console.log(`✅ MongoDB connecté (${mongoose.connection.name})`);
};

module.exports = connectDB;
