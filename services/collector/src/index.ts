import { ResultMessage } from "@message/types/result-message";
import { logger } from "@shared/logger";
import { closeConnection, createConnection } from "@message/rabbitmq";
import { client, collection, connectDb } from "./infra/db";

const RESULTS_QUEUE = "results";

async function collector() {
  await connectDb(process.env.MONGO_URI!);
  const connection = createConnection();

  connection.createConsumer(
    {
      queue: RESULTS_QUEUE,
      queueOptions: { durable: true },
      exchanges: [{ exchange: RESULTS_QUEUE, type: "fanout", durable: true }],
      queueBindings: [{ exchange: RESULTS_QUEUE }],
    },
    async (msg) => {
      const data = msg.body as ResultMessage;

      try {
        const result = await collection.findOne({ chunkId: data.chunkId });
        const updatedValue = await collection.updateOne(
          { chunkId: data.chunkId },
          {
            $set: {
              partialSum: data.partialSum + result?.partialSum || 0,
              receivedAt: new Date(),
            },
          },
          { upsert: true }
        );
        logger().info(`🧮 Document created: ${JSON.stringify(updatedValue)}`);
      } catch (err) {
        logger().error(`Error creating document: ${err}`);
      }
    }
  );
}

collector().catch((error) => logger().error(error));

process.once("SIGINT", async () => {
  await client?.close();
  await closeConnection();
});

process.once("SIGTERM", async () => {
  await client?.close();
  await closeConnection();
});
