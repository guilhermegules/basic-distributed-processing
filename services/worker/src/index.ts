import { logger } from "@shared/logger";
import { ResultMessage } from "@message/types/result-message";
import { ChunkMessage } from "@message/types/chunk-message";
import { closeConnection, createConnection } from "@message/rabbitmq";

const CHUNKS_QUEUE = "chunks";
const RESULTS_QUEUE = "results";

async function worker() {
  const connection = createConnection();

  const resultPublisher = connection.createPublisher({
    confirm: true,
    exchanges: [{ exchange: RESULTS_QUEUE, type: "topic", durable: true }],
  });

  connection.createConsumer(
    {
      queue: CHUNKS_QUEUE,
      queueOptions: { durable: true },
      exchanges: [{ exchange: CHUNKS_QUEUE, type: "fanout", durable: true }],
      queueBindings: [{ exchange: CHUNKS_QUEUE }],
    },
    async (msg) => {
      const body = msg.body as ChunkMessage;

      const sum = body.lines
        .flatMap((l) => l.split(/\s+/).map(Number))
        .filter((n) => !isNaN(n))
        .reduce((a, b) => a + b, 0);

      const resultMessage: ResultMessage = {
        chunkId: body.chunkId,
        linesProcessed: body.lines.length,
        partialSum: sum,
      };

      await resultPublisher.send(
        { exchange: RESULTS_QUEUE, routingKey: "sum.ready" },
        resultMessage
      );

      logger().info(`✅ Worker processed chunk #${body.chunkId} - sum ${sum}`);
    }
  );
}

worker().catch((error) => logger().error(error));

process.once("SIGINT", closeConnection);
process.once("SIGTERM", closeConnection);
