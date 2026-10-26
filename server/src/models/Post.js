import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['request', 'offer'],
      required: [true, 'Post type must be either request or offer'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 1500,
    },
    skillTags: {
      type: [String],
      required: [true, 'At least one skill tag is required'],
      validate: [v => Array.isArray(v) && v.length > 0, 'Provide at least one skill tag'],
    },
    urgency: {
      type: String,
      enum: ['quick_ask', 'full_session', 'flexible'],
      default: 'quick_ask',
    },
    creditAmount: {
      type: Number,
      required: true,
      min: [5, 'Minimum credit amount is 5'],
      max: [200, 'Maximum credit amount is 200'],
      default: 20,
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'completed', 'cancelled'],
      default: 'open',
    },
    matchedSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        message: {
          type: String,
          default: '',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add text indexes for search
postSchema.index({ title: 'text', description: 'text', skillTags: 'text' });
postSchema.index({ status: 1, type: 1, createdAt: -1 });

export const Post = mongoose.model('Post', postSchema);
