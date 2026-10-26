import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester user ID is required'],
    },
    helper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Helper user ID is required'],
    },
    creditAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'disputed', 'cancelled'],
      default: 'pending',
    },
    confirmedByRequester: {
      type: Boolean,
      default: false,
    },
    confirmedByHelper: {
      type: Boolean,
      default: false,
    },
    reviewedByRequester: {
      type: Boolean,
      default: false,
    },
    reviewedByHelper: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.index({ requester: 1, helper: 1, status: 1 });

export const Session = mongoose.model('Session', sessionSchema);
