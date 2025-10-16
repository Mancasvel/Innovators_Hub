import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  price: number; // Price in cents for non-members (e.g., 2500 = €25.00)
  membershipFree: boolean; // If true, members attend for free
  capacity: number; // Now required with default of 50
  ticketsSold: number;
  images?: string[];
  category?: string;
  createdBy: mongoose.Types.ObjectId;
  status: "draft" | "published" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: "Event date must be in the future",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    membershipFree: {
      type: Boolean,
      default: false,
      index: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
      default: 50,
    },
    ticketsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10; // Max 10 images per event
        },
        message: "Cannot have more than 10 images per event",
      },
    },
    category: {
      type: String,
      enum: ["networking", "workshop", "talk", "social", "other"],
      default: "other",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled"],
      default: "published",
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to enforce free event logic
EventSchema.pre("save", function (next) {
  // If price is 0, event is automatically free for everyone
  // This overrides any membershipFree setting
  if (this.price === 0) {
    this.membershipFree = true;
  }
  next();
});

// Pre-update middleware for findOneAndUpdate operations
EventSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as any;

  // If price is being set to 0, automatically set membershipFree to true
  if (update.price === 0) {
    update.membershipFree = true;
  }

  next();
});

// Indexes for performance
EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ status: 1 });

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
