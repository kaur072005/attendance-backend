const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

// Generate OTP
function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Teacher generates OTP
router.post('/create', async (req, res) => {
  const { teacherName, subject, className, ttlMinutes = 10 } = req.body;

  if (!teacherName || !subject || !className)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const session = await Session.create({ teacherName, subject, className, otp, expiresAt });
    res.json({ success: true, otp, sessionId: session._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
