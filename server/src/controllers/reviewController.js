import { Review } from '../models/Review.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

// @desc    Create a review for a completed session
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { sessionId, rating, comment } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a completed session.',
      });
    }

    const userId = req.user._id.toString();
    const isRequester = session.requester.toString() === userId;
    const isHelper = session.helper.toString() === userId;

    if (!isRequester && !isHelper) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this session.',
      });
    }

    const revieweeId = isRequester ? session.helper : session.requester;
    const role = isRequester ? 'requester' : 'helper';

    // Check if already reviewed
    const existingReview = await Review.findOne({
      sessionId: session._id,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this session.',
      });
    }

    // Create review
    const review = await Review.create({
      sessionId: session._id,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: Number(rating),
      comment: comment || '',
      role,
    });

    // Update session review flag
    if (isRequester) {
      session.reviewedByRequester = true;
    } else {
      session.reviewedByHelper = true;
    }
    await session.save();

    // Recalculate average rating of reviewee
    const allReviews = await Review.find({ reviewee: revieweeId });
    const totalRatingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAvg = Number((totalRatingSum / allReviews.length).toFixed(1));

    await User.findByIdAndUpdate(revieweeId, {
      avgRating: newAvg,
      reviewCount: allReviews.length,
    });

    // Send Notification to reviewee
    await Notification.create({
      recipient: revieweeId,
      sender: req.user._id,
      type: 'review_received',
      title: 'New Review Received! ⭐',
      message: `${req.user.name} rated you ${rating} stars: "${comment || 'Great session!'}"`,
      link: `/profile/${revieweeId}`,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name major avatar')
      .populate('reviewee', 'name major avatar');

    res.status(201).json({
      success: true,
      review: populatedReview,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name major avatar campus')
      .populate({
        path: 'sessionId',
        populate: {
          path: 'postId',
          select: 'title skillTags type',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (err) {
    next(err);
  }
};
