const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

// List all users (admin only)
router.get('/', auth, role('admin'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Get user by ID (admin only)
router.get('/:id', auth, role('admin'), async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
});

// Create user (admin only)
router.post(
  '/',
  auth,
  role('admin'),
  [
    body('username').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'manager', 'employee'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password, role } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) return res.status(400).json({ msg: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    user = new User({ username, email, password: hashed, role });
    await user.save();
    res.status(201).json({ id: user.id, username, email, role });
  }
);

// Update user (admin only)
router.put(
  '/:id',
  auth,
  role('admin'),
  [
    body('username').optional().notEmpty(),
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'manager', 'employee'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { username, email, password, role } = req.body;
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    await user.save();
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  }
);

// Delete user (admin only)
router.delete('/:id', auth, role('admin'), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json({ msg: 'User deleted' });
});

module.exports = router; 