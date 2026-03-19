const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true, required: true },
  password: { type: String },
  jobTitle: { type: String, default: 'Full Stack Engineer' },
  bio: { type: String, default: 'Building custom dashboard solutions with precision and style.' },
  company: { type: String, default: 'Insyte Studio' },
  location: { type: String, default: 'San Francisco, CA' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);