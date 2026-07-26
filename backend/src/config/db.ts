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
    
    // Synchronize Mongoose indexes to ensure { email: 1, role: 1 } compound index is active and drop any legacy email_1 index
    try {
      const { User } = require("../models/User");
      await User.syncIndexes();
      console.log("[DB Indexes] User model indexes synchronized ({ email: 1, role: 1 } compound unique index)");

      const usersWithAvatars = await User.find({ avatar: { $exists: true, $ne: null } });
      console.log(`[DB Clean] Found ${usersWithAvatars.length} users with avatars. Checking sizes...`);
      let cleanedCount = 0;
      for (const u of usersWithAvatars) {
        const size = u.avatar ? u.avatar.length : 0;
        if (size > 150000) {
          console.log(`[DB Clean] User "${u.name}" (${u.email}) has a massive avatar (${Math.round(size / 1024)} KB). Resetting...`);
          u.avatar = "";
          await u.save();
          cleanedCount++;
        }
      }
      if (cleanedCount > 0) {
        console.log(`[DB Clean] Successfully optimized ${cleanedCount} user records.`);
      }
    } catch (cleanErr) {
      console.warn("Failed to run DB index sync / cleanup script:", cleanErr);
    }
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
