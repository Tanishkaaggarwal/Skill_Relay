import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

// @desc    Get all posts with search, filter, and pagination
// @route   GET /api/posts
// @access  Public
export const getPosts = async (req, res, next) => {
  try {
    const { type, search, skill, urgency, status = 'open', sort = 'newest' } = req.query;

    const query = {};

    // Filter by status (default is open)
    if (status !== 'all') {
      query.status = status;
    }

    // Filter by post type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by urgency
    if (urgency && urgency !== 'all') {
      query.urgency = urgency;
    }

    // Filter by skill tag
    if (skill) {
      query.skillTags = { $regex: new RegExp(`^${skill.trim()}$`, 'i') };
    }

    // Text search query
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { skillTags: searchRegex },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest') sortOptions = { createdAt: 1 };
    if (sort === 'credits_high') sortOptions = { creditAmount: -1 };
    if (sort === 'credits_low') sortOptions = { creditAmount: 1 };

    const posts = await Post.find(query)
      .populate('author', 'name email major campus avatar avgRating reviewCount')
      .populate('applicants.user', 'name major avatar avgRating')
      .sort(sortOptions);

    res.json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get personalized recommended posts for logged-in user
// @route   GET /api/posts/recommended
// @access  Private
export const getRecommendedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const skillsOffered = user.skillsOffered || [];
    const skillsWanted = user.skillsWanted || [];

    // Find open posts created by others
    const query = {
      author: { $ne: user._id },
      status: 'open',
      $or: [
        // Case 1: Open Requests matching skills I can offer
        {
          type: 'request',
          skillTags: {
            $in: skillsOffered.map((s) => new RegExp(`^${s}$`, 'i')),
          },
        },
        // Case 2: Open Offers matching skills I want
        {
          type: 'offer',
          skillTags: {
            $in: skillsWanted.map((s) => new RegExp(`^${s}$`, 'i')),
          },
        },
      ],
    };

    let recommendedPosts = [];
    if (skillsOffered.length > 0 || skillsWanted.length > 0) {
      recommendedPosts = await Post.find(query)
        .populate('author', 'name email major campus avatar avgRating reviewCount')
        .populate('applicants.user', 'name major avatar avgRating')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    // If no direct matches, return top open requests/offers with high-rated authors
    if (recommendedPosts.length === 0) {
      recommendedPosts = await Post.find({
        author: { $ne: user._id },
        status: 'open',
      })
        .populate('author', 'name email major campus avatar avgRating reviewCount')
        .populate('applicants.user', 'name major avatar avgRating')
        .sort({ createdAt: -1 })
        .limit(5);
    }

    res.json({
      success: true,
      count: recommendedPosts.length,
      posts: recommendedPosts,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email major campus bio avatar avgRating reviewCount sessionsCompleted')
      .populate('applicants.user', 'name email major avatar avgRating reviewCount');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new request or offer post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { type, title, description, skillTags, urgency, creditAmount } = req.body;

    const user = await User.findById(req.user._id);

    // If posting a request, ensure requester has enough credits
    const amount = Number(creditAmount) || (urgency === 'full_session' ? 50 : 20);
    if (type === 'request' && user.creditBalance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient credits! You need at least ${amount} credits to post this request. Current balance: ${user.creditBalance}.`,
      });
    }

    const post = await Post.create({
      type,
      author: req.user._id,
      title,
      description,
      skillTags: Array.isArray(skillTags)
        ? skillTags
        : skillTags.split(',').map((s) => s.trim()).filter(Boolean),
      urgency: urgency || 'quick_ask',
      creditAmount: amount,
    });

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name email major campus avatar avgRating reviewCount'
    );

    res.status(201).json({
      success: true,
      post: populatedPost,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    if (post.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Cannot edit a post that is already matched or completed' });
    }

    const { title, description, skillTags, urgency, creditAmount } = req.body;

    if (title) post.title = title;
    if (description) post.description = description;
    if (skillTags) {
      post.skillTags = Array.isArray(skillTags)
        ? skillTags
        : skillTags.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if (urgency) post.urgency = urgency;
    if (creditAmount) post.creditAmount = Number(creditAmount);

    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name email major campus avatar avgRating reviewCount'
    );

    res.json({
      success: true,
      post: populatedPost,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete or cancel post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    if (post.status === 'matched') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a post with an active matched session. Cancel the session first.',
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post successfully deleted',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply / Offer help on a post
// @route   POST /api/posts/:id/apply
// @access  Private
export const applyToPost = async (req, res, next) => {
  try {
    const { message } = req.body;
    const post = await Post.findById(req.params.id).populate('author', 'name email');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot apply to your own post.',
      });
    }

    if (post.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'This post is no longer open for new applications.',
      });
    }

    // Check if user has already applied
    const alreadyApplied = post.applicants.some(
      (app) => app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied/connected to this post.',
      });
    }

    // Check credit requirement if applicant is requesting from an offer
    if (post.type === 'offer') {
      const applicantUser = await User.findById(req.user._id);
      if (applicantUser.creditBalance < post.creditAmount) {
        return res.status(400).json({
          success: false,
          message: `You need at least ${post.creditAmount} credits to request this skill. Current balance: ${applicantUser.creditBalance}.`,
        });
      }
    }

    post.applicants.push({
      user: req.user._id,
      message: message || '',
      createdAt: new Date(),
    });

    await post.save();

    // Create Notification for post author
    await Notification.create({
      recipient: post.author._id,
      sender: req.user._id,
      type: 'session_request',
      title: post.type === 'request' ? 'New Offer to Help!' : 'New Skill Request!',
      message: `${req.user.name} responded to your ${post.type}: "${post.title}".`,
      link: `/posts/${post._id}`,
    });

    const updatedPost = await Post.findById(post._id)
      .populate('author', 'name email major campus avatar avgRating reviewCount')
      .populate('applicants.user', 'name email major avatar avgRating reviewCount');

    res.json({
      success: true,
      message: 'Application submitted successfully',
      post: updatedPost,
    });
  } catch (err) {
    next(err);
  }
};
