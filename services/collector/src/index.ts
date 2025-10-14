import { ResultMessage } from "@message/types/result-message";
import { logger } from "@shared/logger";
import { closeConnection, createConnection } from "@message/rabbitmq";

const RESULTS_QUEUE = "results";

async function collector() {
  const connection = createConnection();

  let totalSum = 0;
  let chunksReceived = 0;

  connection.createConsumer(
    {
      queue: RESULTS_QUEUE,
      queueOptions: { durable: true },
      exchanges: [{ exchange: RESULTS_QUEUE, type: "topic", durable: true }],
      queueBindings: [{ exchange: RESULTS_QUEUE }],
    },
    async (msg) => {
      const data = msg.body as ResultMessage;

      totalSum += data.partialSum;
      chunksReceived++;

      logger().info(
        `🧮 Received partial sum from chunk #${data.chunkId} -> partial = ${data.partialSum} | total = ${totalSum}`
      );
    }
  );
}

collector().catch((error) => logger().error(error));

process.once("SIGINT", closeConnection);
process.once("SIGTERM", closeConnection);
