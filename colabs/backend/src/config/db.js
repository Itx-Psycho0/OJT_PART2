import mongoose from "mongoose";
import config from "./config.js";
import AppError from "../utils/appError.js";

const connectDB = async () => {
  const mongoUri = config.mongoUri;

  if (!mongoUri) {
    throw new AppError("MONGO_URI is not defined in environment variables", 500);
  }

  await mongoose.connect(mongoUri);

  console.log("MongoDB connected successfully");
};

export default connectDB;