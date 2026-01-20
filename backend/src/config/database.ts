import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-attendance';
    
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    });
    
    console.log('✅ MongoDB connected successfully');

    mongoose.connection.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('⚠️ Server will continue without database. Some features may not work.');
    // Don't exit, allow server to run for testing
  }
};
