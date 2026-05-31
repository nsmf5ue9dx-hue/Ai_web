const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// জেনারেট JWT টোকেন
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// ✅ রেজিস্টার এন্ডপয়েন্ট
router.post('/register', [
  body('name').notEmpty().withMessage('নাম প্রয়োজন'),
  body('email').isEmail().withMessage('বৈধ ইমেইল প্রয়োজন'),
  body('password').isLength({ min: 6 }).withMessage('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // ইমেইল ইতিমধ্যে আছে কিনা চেক করুন
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'এই ইমেইল ইতিমধ্যে ব্যবহৃত হয়েছে'
      });
    }

    // নতুন ব্যবহারকারী তৈরি করুন
    const user = await User.create({ name, email, password });

    // টোকেন জেনারেট করুন
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'রেজিস্ট্রেশন সফল',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'রেজিস্ট্রেশন ব্যর্থ',
      error: error.message
    });
  }
});

// ✅ লগইন এন্ডপয়েন্ট
router.post('/login', [
  body('email').isEmail().withMessage('বৈধ ইমেইল প্রয়োজন'),
  body('password').notEmpty().withMessage('পাসওয়ার্ড প্রয়োজন')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // ব্যবহারকারী খুঁজুন
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }

    // পাসওয়ার্ড যাচাই করুন
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'ইমেইল বা পাসওয়ার্ড ভুল'
      });
    }

    // টোকেন জেনারেট করুন
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'লগইন সফল',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'লগইন ব্যর্থ',
      error: error.message
    });
  }
});

// ✅ প্রোফাইল এন্ডপয়েন্ট (সুরক্ষিত)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'প্রোফাইল লোড করা ব্যর্থ',
      error: error.message
    });
  }
});

// ✅ লগআউট এন্ডপয়েন্ট
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'লগআউট সফল',
    token: null
  });
});

module.exports = router;
