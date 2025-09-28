const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  teacherName: String,
  subject: String,
  className: String,
  otp: String,
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
  // remove sessionCode completely
});

module.exports = mongoose.model('Session', sessionSchema);
