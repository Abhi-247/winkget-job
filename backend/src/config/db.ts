import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB URI:", uri);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
