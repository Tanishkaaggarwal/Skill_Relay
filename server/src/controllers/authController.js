import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'skill_relay_campus_secret_key_2026_jwt',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, campus, major, bio, skillsOffered, skillsWanted } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address.',
      });
    }

    // Create user with 100 starting credits
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      campus: campus || 'Main Campus',
      major: major || 'General Studies',
      bio: bio || 'Enthusiastic student eager to share and learn new skills!',
      skillsOffered: skillsOffered || [],
      skillsWanted: skillsWanted || [],
      creditBalance: 100,
    });

    // Create initial signup bonus transaction
    await Transaction.create({
      userId: user._id,
      type: 'initial_bonus',
      amount: 100,
      balanceAfter: 100,
      description: 'Welcome Bonus: 100 starting credits to kickstart your campus help exchange!',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        campus: user.campus,
        major: user.major,
        bio: user.bio,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        creditBalance: user.creditBalance,
        avgRating: user.avgRating,
        reviewCount: user.reviewCount,
        sessionsCompleted: user.sessionsCompleted,
        totalCreditsEarned: user.totalCreditsEarned,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        campus: user.campus,
        major: user.major,
        bio: user.bio,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        creditBalance: user.creditBalance,
        avgRating: user.avgRating,
        reviewCount: user.reviewCount,
        sessionsCompleted: user.sessionsCompleted,
        totalCreditsEarned: user.totalCreditsEarned,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get demo users list for 1-click login
// @route   GET /api/auth/demo-users
// @access  Public
export const getDemoUsers = async (req, res, next) => {
  try {
    const demoUsers = await User.find({}).limit(10).select('name email major skillsOffered skillsWanted creditBalance avgRating');
    res.json({
      success: true,
      users: demoUsers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    1-Click Demo Login
// @route   POST /api/auth/demo-login
// @access  Public
export const demoLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email ? email.toLowerCase().trim() : undefined });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Demo user not found. Please run seed script first.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};
