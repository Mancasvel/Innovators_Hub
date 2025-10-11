import mongoose from 'mongoose';

/**
 * MongoDB connection handler with connection pooling
 * Reuses existing connection in serverless environment
 */

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not defined. Database functionality will be disabled.');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global type for caching in development
declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Clear cache on module reload in development
if (process.env.NODE_ENV === 'development') {
  global.mongooseCache = undefined;
}

let cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB with connection caching
 * Prevents multiple connections in serverless functions
 */
export async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined. Database functionality is disabled.');
  }

  if (cached.conn) {
    console.log('🔄 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔗 Creating new MongoDB connection...');
    console.log('📊 MONGODB_URI ends with:', MONGODB_URI?.split('/').pop());
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;



