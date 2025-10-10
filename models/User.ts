import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * User roles in the system
 * - user: regular user (default)
 * - organizer: can create events and scan tickets
 * - admin: full access to all features
 */
export type UserRole = 'user' | 'organizer' | 'admin';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string; // Optional for OAuth users (stored as hash)
  role: UserRole;
  image?: string;
  emailVerified?: Date;
  stripeCustomerId?: string;
  hasMembership: boolean; // True if user has active annual membership
  membershipExpires?: Date; // Track when membership ends
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: ['user', 'organizer', 'admin'],
      default: 'user',
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    hasMembership: {
      type: Boolean,
      default: false,
      index: true,
    },
    membershipExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ stripeCustomerId: 1 });

// Prevent model recompilation in Next.js hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;



