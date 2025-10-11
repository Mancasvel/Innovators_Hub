import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId; // References User
  eventId: mongoose.Types.ObjectId; // References Event
  rating: number; // 1-5 stars
  comment?: string;
  verified: boolean; // True if user attended the event
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Review must be for an event'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      index: true,
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for performance
ReviewSchema.index({ eventId: 1, userId: 1 }); // Ensure one review per user per event
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ verified: 1 });

// Prevent model recompilation in Next.js hot reload
const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
