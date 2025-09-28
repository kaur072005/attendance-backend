const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  studentName: String,
  rollNumber: String,
  subject: String,      // Added
  className: String,    // Added
  submittedAt: { type: Date, default: Date.now },
  extra: Object
});

module.exports = mongoose.model('Attendance', attendanceSchema);
