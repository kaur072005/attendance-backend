const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const XLSX = require('xlsx'); // Excel generation

// POST: Submit attendance
router.post('/submit', async (req, res) => {
  const { studentName, rollNumber, otp } = req.body;
  if (!studentName || !rollNumber || !otp)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    // Find session by OTP
    const session = await Session.findOne({ otp, isActive: true });
    if (!session) return res.status(404).json({ error: 'Session not found or closed' });

    if (session.expiresAt && new Date(session.expiresAt) < new Date())
      return res.status(400).json({ error: 'Session expired' });

    // POST: Submit attendance
   const attendance = await Attendance.create({
  sessionId: session._id,
  studentName: studentName.trim(),
  rollNumber: rollNumber.trim(),
  subject: session.subject.trim(),       
  className: session.className.trim(),  
  extra: { ip: req.ip, ua: req.headers['user-agent'] },
  submittedAt: new Date()
});


    res.json({ success: true, message: 'Attendance submitted successfully', attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET: Download Attendance as Excel
router.get('/download', async (req, res) => {
  try {
    const { subject, className, date } = req.query;

    // MongoDB query
   let query = {};
if (subject) query.subject = { $regex: new RegExp(`^${subject.trim()}$`, 'i') };
if (className) query.className = { $regex: new RegExp(`^${className.trim()}$`, 'i') };
if (date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  query.submittedAt = { $gte: start, $lte: end }; // ✅ use submittedAt, not createdAt
}

    console.log('Excel Query:', query);
    const records = await Attendance.find(query).lean();

    if (records.length === 0) {
      return res.status(404).json({ error: "No records found" });
    }

   const data = records.map(r => ({
  "Student Name": r.studentName,
  "Roll Number": r.rollNumber,
  "OTP": r.otp || "",
  "Subject": r.subject || "",
  "Class": r.className || "",
  "Status": r.status || "Present",
  "Date/Time": new Date(r.submittedAt).toLocaleString(),
}));


    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const filePath = `Attendance-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, filePath);

    res.download(filePath, err => {
      if (err) console.error(err);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while generating Excel" });
  }
});

module.exports = router;
