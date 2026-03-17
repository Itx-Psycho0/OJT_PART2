import mongoose from "mongoose";
import config from "./config.js";

const connectDB = async () => {
  const mongoUri = config.mongoUri;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  await mongoose.connect(mongoUri);

  console.log("MongoDB connected successfully");
};

export default connectDB;