import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill-relay';
  
  try {
    // Attempt standard connection first with 3s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`⚠️ Standard MongoDB connection failed (${err.message}). Starting embedded MongoMemoryServer for immediate zero-config demo...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`✅ Connected to Embedded In-Memory MongoDB at: ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to connect to In-Memory MongoDB:', memErr);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.connection.close();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
