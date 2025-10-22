import { logger } from "@shared/logger";
import { Collection, MongoClient } from "mongodb";

export let client: MongoClient;
export let collection: Collection;

export async function connectDb(uri: string) {
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db("collector");
    collection = db.collection("results");
    logger().info("✅ Connected to MongoDB");
  } catch (error) {
    logger().error(`❌ MongoDB connection failed ${JSON.stringify(error)}`);
    process.exit(1);
  }
}
