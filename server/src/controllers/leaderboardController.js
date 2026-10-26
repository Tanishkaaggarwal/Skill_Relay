import { User } from '../models/User.js';

// @desc    Get campus leaderboard
// @route   GET /api/leaderboard
// @access  Public
export const getLeaderboard = async (req, res, next) => {
  try {
    const { sortBy = 'credits' } = req.query;

    let sortOptions = { totalCreditsEarned: -1, sessionsCompleted: -1, avgRating: -1 };
    if (sortBy === 'sessions') {
      sortOptions = { sessionsCompleted: -1, totalCreditsEarned: -1, avgRating: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { avgRating: -1, reviewCount: -1, sessionsCompleted: -1 };
    }

    const leaders = await User.find({})
      .select('name major campus avatar creditBalance totalCreditsEarned sessionsCompleted avgRating reviewCount skillsOffered')
      .sort(sortOptions)
      .limit(20);

    // Annotate with rank and honor badges
    const rankedLeaders = leaders.map((leader, index) => {
      let badge = 'Contributor';
      if (index === 0) badge = 'Campus Legend 👑';
      else if (index === 1) badge = 'Master Helper 🥈';
      else if (index === 2) badge = 'Skill Champion 🥉';
      else if (leader.sessionsCompleted >= 5) badge = 'Expert Relay Partner ⚡';
      else if (leader.avgRating >= 4.8 && leader.reviewCount > 0) badge = 'Top Rated Mentor ⭐';

      return {
        rank: index + 1,
        badge,
        ...leader.toObject(),
      };
    });

    res.json({
      success: true,
      count: rankedLeaders.length,
      leaders: rankedLeaders,
    });
  } catch (err) {
    next(err);
  }
};
