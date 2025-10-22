import mongoose from "mongoose";
import { logger } from "@shared/logger";

let isConnected = false;

export async function connectDB(uri: string) {
  logger().info(uri);

  if (isConnected) return;

  try {
    await mongoose.connect(uri);
    isConnected = true;
    logger().info("✅ Connected to MongoDB");
  } catch (error) {
    logger().error(`❌ MongoDB connection failed ${JSON.stringify(error)}`);
    process.exit(1);
  }
}

export const ResultSchema = new mongoose.Schema({
  chunkId: { type: String, required: true, unique: true },
  partialSum: { type: Number, required: true },
  receivedAt: { type: Date, default: Date.now },
});

export const ResultModel = mongoose.model("Result", ResultSchema);
