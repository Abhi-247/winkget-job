import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in environment variables");
    process.exit(1);
  }

  try {
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
    console.log("Connecting to MongoDB:", maskedUri);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    
    // Synchronize Mongoose indexes to ensure { email: 1, role: 1 } compound index is active and drop any legacy email_1 index
    try {
      const { User } = require("../models/User");
      await User.syncIndexes();
      console.log("[DB Indexes] User model indexes synchronized ({ email: 1, role: 1 } compound unique index)");

      // Ensure default Admin user exists in MongoDB & update password to password123
      let adminUser = await User.findOne({ role: "admin" });
      if (!adminUser) {
        adminUser = await User.create({
          name: "System Admin",
          email: "admin@winkget.com",
          password: "password123",
          role: "admin",
        });
        console.log("[DB Seed] Created default Admin user (admin@winkget.com / password123)");
      } else {
        adminUser.password = "password123";
        await adminUser.save();
        console.log("[DB Seed] Admin password updated to 'password123'");
      }

      // Optimized update query to clear massive base64 avatars (> 150KB) in one database operation
      const result = await User.updateMany(
        {
          avatar: { $exists: true, $ne: "" },
          $expr: { $gt: [{ $strLenCP: "$avatar" }, 150000] }
        },
        { $set: { avatar: "" } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[DB Clean] Successfully optimized ${result.modifiedCount} user records with large avatars.`);
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
