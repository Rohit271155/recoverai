import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recoverai';

  try {
    // First try connecting to configured URI with short timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[Database] Connected successfully to MongoDB at ${uri}`);
    return mongoose.connection;
  } catch (error) {
    console.warn(`[Database] Could not connect to local MongoDB (${error.message}).`);
    console.log('[Database] Initializing fallback in-memory MongoDB server (MongoMemoryServer)...');

    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected successfully to In-Memory MongoDB at ${memoryUri}`);
      return mongoose.connection;
    } catch (memError) {
      console.error('[Database] Failed to start In-Memory MongoDB:', memError.message);
      throw memError;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (error) {
    console.error('[Database] Error disconnecting:', error.message);
  }
};
