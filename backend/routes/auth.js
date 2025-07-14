const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'manager', 'employee']).withMessage('Role must be admin, manager, or employee')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password, role } = req.body;
    try {
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) return res.status(400).json({ msg: 'User already exists' });
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      user = new User({ username, email, password: hashed, role });
      await user.save();
      const payload = { id: user.id, username: user.username, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail(), body('password').exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
      const payload = { id: user.id, username: user.username, role: user.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get profile
router.get('/profile', auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put(
  '/profile',
  auth,
  [body('username').optional().notEmpty(), body('email').optional().isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password } = req.body;
    try {
      if (username) req.user.username = username;
      if (email) req.user.email = email;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        req.user.password = await bcrypt.hash(password, salt);
      }
      await req.user.save();
      res.json(req.user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Forgot Password
router.post('/forgot-password', [body('email').isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'No user with that email' });
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Set up nodemailer transporter (using Gmail)
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send email with reset link
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    let info = await transporter.sendMail({
      from: 'no-reply@employee-management.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset.\n\nClick the link below to reset your password:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`
    });

    res.json({ msg: 'Password reset email sent', preview: nodemailer.getTestMessageUrl(info) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset Password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { token, password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ msg: 'Password has been reset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 