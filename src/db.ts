import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> origin/main
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not defined");
  await mongoose.connect(uri);
  console.log("MongoDB connected");
<<<<<<< HEAD
=======
=======
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in .env");
    }
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
>>>>>>> origin/main
>>>>>>> origin/main
};

export default connectDB;
