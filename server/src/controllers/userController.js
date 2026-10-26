import { User } from '../models/User.js';

// @desc    Get user public profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, campus, major, bio, skillsOffered, skillsWanted, avatar } = req.body;

    if (name) user.name = name.trim();
    if (campus) user.campus = campus.trim();
    if (major) user.major = major.trim();
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    if (skillsOffered) {
      user.skillsOffered = Array.isArray(skillsOffered)
        ? skillsOffered
        : skillsOffered.split(',').map((s) => s.trim()).filter(Boolean);
    }

    if (skillsWanted) {
      user.skillsWanted = Array.isArray(skillsWanted)
        ? skillsWanted
        : skillsWanted.split(',').map((s) => s.trim()).filter(Boolean);
    }

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};
