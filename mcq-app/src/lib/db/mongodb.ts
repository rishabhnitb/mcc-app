import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rishabhnitb:bjc2VPKmSHtUapFC@mcq-cluster-a.awukcps.mongodb.net/?retryWrites=true&w=majority&appName=mcq-cluster-A';

// This is a server-side module

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect() {
  try {
    // Check if we have a cached connection that's still active
    if (cached.conn) {
      if (mongoose.connection.readyState === 1) {
        console.log('Using cached database connection');
        return cached.conn;
      }
      
      // If connection is not active, clean up
      console.log('Cached connection is not active, cleaning up...');
      try {
        await mongoose.connection.close();
      } catch (err) {
        console.warn('Error closing stale connection:', err);
      }
      cached.conn = null;
      cached.promise = null;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        retryReads: true,
        family: 4, // Force IPv4
        autoCreate: true,
        autoIndex: true,
        maxIdleTimeMS: 30000, // Close inactive connections after 30 seconds
      };

      console.log('Connecting to MongoDB...');
      cached.promise = mongoose.connect(MONGODB_URI, opts)
        .then((mongoose) => {
          console.log('Successfully connected to MongoDB.');
          mongoose.set('debug', true); // Enable mongoose debug mode
          return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    cached.promise = null;
    cached.conn = null;
    throw e;
  }
}

export default dbConnect;
