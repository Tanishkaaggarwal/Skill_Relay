import mongoose from 'mongoose';
import { Session } from '../models/Session.js';
import { Post } from '../models/Post.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';

// @desc    Accept applicant and create an active session
// @route   POST /api/sessions/accept
// @access  Private
export const acceptApplicantAndCreateSession = async (req, res, next) => {
  try {
    const { postId, applicantId } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the author of the post can accept applications.',
      });
    }

    if (post.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Post is no longer open.',
      });
    }

    let requesterId, helperId;
    if (post.type === 'request') {
      // Author needed help (requester), applicant is giving help (helper)
      requesterId = post.author;
      helperId = applicantId;
    } else {
      // Author is offering help (helper), applicant requested help (requester)
      requesterId = applicantId;
      helperId = post.author;
    }

    // Verify requester has sufficient credits
    const requester = await User.findById(requesterId);
    if (!requester || requester.creditBalance < post.creditAmount) {
      return res.status(400).json({
        success: false,
        message: `Requester does not have sufficient credits (${post.creditAmount} required).`,
      });
    }

    // Create session
    const session = await Session.create({
      postId: post._id,
      requester: requesterId,
      helper: helperId,
      creditAmount: post.creditAmount,
      status: 'active',
      startedAt: new Date(),
    });

    // Mark post as matched
    post.status = 'matched';
    post.matchedSession = session._id;
    await post.save();

    // Create initial system message in session chat
    await Message.create({
      sessionId: session._id,
      sender: req.user._id,
      content: `🎉 Session initiated! Please use this chat to coordinate and share resources. Once your session is finished, both participants must click "Mark Complete" to transfer the ${post.creditAmount} credits.`,
      isSystem: true,
    });

    // Notify the other party
    const recipientId = applicantId.toString() === req.user._id.toString() ? post.author : applicantId;
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: 'session_accepted',
      title: 'Session Started!',
      message: `Your connection for "${post.title}" has been accepted. Join the workspace to start collaborating.`,
      link: `/sessions/${session._id}`,
    });

    const populatedSession = await Session.findById(session._id)
      .populate('requester', 'name email major avatar creditBalance avgRating')
      .populate('helper', 'name email major avatar creditBalance avgRating')
      .populate('postId', 'title description skillTags urgency creditAmount type');

    res.status(201).json({
      success: true,
      session: populatedSession,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's active and past sessions
// @route   GET /api/sessions/my-sessions
// @access  Private
export const getMySessions = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const sessions = await Session.find({
      $or: [{ requester: userId }, { helper: userId }],
    })
      .populate('requester', 'name email major avatar avgRating reviewCount')
      .populate('helper', 'name email major avatar avgRating reviewCount')
      .populate('postId', 'title description skillTags urgency creditAmount type')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get session details by ID
// @route   GET /api/sessions/:id
// @access  Private
export const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('requester', 'name email major bio avatar creditBalance avgRating reviewCount sessionsCompleted')
      .populate('helper', 'name email major bio avatar creditBalance avgRating reviewCount sessionsCompleted')
      .populate('postId');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    const isParticipant =
      session.requester._id.toString() === userId ||
      session.helper._id.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this session.',
      });
    }

    res.json({
      success: true,
      session,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm session completion & trigger atomic credit settlement
// @route   PUT /api/sessions/:id/confirm-complete
// @access  Private
export const confirmSessionComplete = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This session is already marked complete and credits have been settled.',
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete a session with status '${session.status}'.`,
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

    // Set confirmation flag
    if (isRequester) {
      session.confirmedByRequester = true;
    }
    if (isHelper) {
      session.confirmedByHelper = true;
    }

    let isFullySettled = false;

    // Check if BOTH parties have confirmed
    if (session.confirmedByRequester && session.confirmedByHelper) {
      // === ATOMIC CREDIT TRANSFER OPERATION ===
      const creditAmount = session.creditAmount;
      const requesterUser = await User.findById(session.requester);
      const helperUser = await User.findById(session.helper);

      if (!requesterUser || !helperUser) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching session participants for credit settlement.',
        });
      }

      // Check balance (safety check)
      if (requesterUser.creditBalance < creditAmount) {
        return res.status(400).json({
          success: false,
          message: `Requester does not have sufficient credits (${requesterUser.creditBalance} available, ${creditAmount} required).`,
        });
      }

      // 1. Atomically debit requester
      const updatedRequester = await User.findByIdAndUpdate(
        session.requester,
        {
          $inc: {
            creditBalance: -creditAmount,
            sessionsCompleted: 1,
          },
        },
        { new: true }
      );

      // 2. Atomically credit helper
      const updatedHelper = await User.findByIdAndUpdate(
        session.helper,
        {
          $inc: {
            creditBalance: creditAmount,
            totalCreditsEarned: creditAmount,
            sessionsCompleted: 1,
          },
        },
        { new: true }
      );

      const post = await Post.findById(session.postId);
      const postTitle = post ? post.title : 'Campus Help Session';

      // 3. Create Transaction Ledger record for Requester (Debit)
      await Transaction.create({
        userId: session.requester,
        sessionId: session._id,
        postId: session.postId,
        type: 'debit',
        amount: -creditAmount,
        balanceAfter: updatedRequester.creditBalance,
        description: `Paid ${creditAmount} credits to ${helperUser.name} for "${postTitle}".`,
      });

      // 4. Create Transaction Ledger record for Helper (Credit)
      await Transaction.create({
        userId: session.helper,
        sessionId: session._id,
        postId: session.postId,
        type: 'credit',
        amount: creditAmount,
        balanceAfter: updatedHelper.creditBalance,
        description: `Earned ${creditAmount} credits from ${requesterUser.name} for helping with "${postTitle}".`,
      });

      // 5. Update Session and Post status
      session.status = 'completed';
      session.completedAt = new Date();
      if (post) {
        post.status = 'completed';
        await post.save();
      }

      isFullySettled = true;

      // 6. Add System message in chat
      await Message.create({
        sessionId: session._id,
        sender: req.user._id,
        content: `🎉 Session officially completed! ${creditAmount} credits have been transferred to ${helperUser.name}. Please take a moment to rate and review each other!`,
        isSystem: true,
      });

      // 7. Send Notifications
      await Notification.create({
        recipient: session.requester,
        sender: session.helper,
        type: 'session_completed',
        title: 'Session Completed!',
        message: `Your session for "${postTitle}" is complete. ${creditAmount} credits transferred. Please rate your helper!`,
        link: `/sessions/${session._id}`,
      });

      await Notification.create({
        recipient: session.helper,
        sender: session.requester,
        type: 'credit_received',
        title: 'Credits Received! 🪙',
        message: `You earned ${creditAmount} credits for completing the session for "${postTitle}"!`,
        link: `/sessions/${session._id}`,
      });
    } else {
      // Notify the other user that one party has confirmed
      const otherUserId = isRequester ? session.helper : session.requester;
      const post = await Post.findById(session.postId);
      await Notification.create({
        recipient: otherUserId,
        sender: req.user._id,
        type: 'session_confirmed',
        title: 'Completion Confirmed',
        message: `${req.user.name} marked the session for "${post ? post.title : 'your help session'}" as complete. Please confirm on your end to finalize credit transfer.`,
        link: `/sessions/${session._id}`,
      });

      await Message.create({
        sessionId: session._id,
        sender: req.user._id,
        content: `✓ ${req.user.name} marked this session as complete. Waiting for mutual confirmation.`,
        isSystem: true,
      });
    }

    await session.save();

    const populatedSession = await Session.findById(session._id)
      .populate('requester', 'name email major avatar creditBalance avgRating')
      .populate('helper', 'name email major avatar creditBalance avgRating')
      .populate('postId');

    res.json({
      success: true,
      message: isFullySettled
        ? 'Session completed and credits atomically settled!'
        : 'Your completion confirmation was recorded. Waiting for the other party to confirm.',
      isFullySettled,
      session: populatedSession,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get session messages
// @route   GET /api/sessions/:id/messages
// @access  Private
export const getSessionMessages = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    if (session.requester.toString() !== userId && session.helper.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const messages = await Message.find({ sessionId: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a message in session chat
// @route   POST /api/sessions/:id/messages
// @access  Private
export const sendSessionMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    if (session.requester.toString() !== userId && session.helper.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const message = await Message.create({
      sessionId: session._id,
      sender: req.user._id,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

    // Notify recipient
    const recipientId = session.requester.toString() === userId ? session.helper : session.requester;
    await Notification.create({
      recipient: recipientId,
      sender: req.user._id,
      type: 'new_message',
      title: `New message from ${req.user.name}`,
      message: content.length > 60 ? `${content.substring(0, 60)}...` : content,
      link: `/sessions/${session._id}`,
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel an active session
// @route   PUT /api/sessions/:id/cancel
// @access  Private
export const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an already completed session.',
      });
    }

    const userId = req.user._id.toString();
    if (session.requester.toString() !== userId && session.helper.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    session.status = 'cancelled';
    await session.save();

    // Reopen post
    const post = await Post.findById(session.postId);
    if (post) {
      post.status = 'open';
      post.matchedSession = null;
      await post.save();
    }

    res.json({
      success: true,
      message: 'Session has been cancelled.',
    });
  } catch (err) {
    next(err);
  }
};
