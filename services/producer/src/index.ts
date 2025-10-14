import { logger } from "@shared/logger";
import { closeConnection, createConnection } from "@message/rabbitmq";
import { ChunkMessage } from "@message/types/chunk-message";
import { readFileChunks } from "@shared/utils";
import path from "path";

const FILE_PATH = path.resolve(__dirname, "../../../data/large-file.txt");
const CHUNK_SIZE = 1000;
const CHUNKS_QUEUE = "chunks";

async function producer() {
  const connection = createConnection();

  const publisher = connection.createPublisher({
    confirm: true,
    maxAttempts: 3,
    exchanges: [{ exchange: CHUNKS_QUEUE, type: "fanout", durable: true }],
  });

  const chunks = readFileChunks(FILE_PATH, CHUNK_SIZE);

  for await (const chunk of chunks) {
    const chunkId = crypto.randomUUID();
    const message: ChunkMessage = {
      chunkId,
      lines: chunk,
    };

    await publisher.send(
      { exchange: CHUNKS_QUEUE, routingKey: "chunk.ready", durable: true },
      message
    );

    logger().info(`📦 Sent chunk ${chunkId} (${message.lines.length} lines)`);
  }
}

producer().catch((error) => logger().error(error));

process.once("SIGINT", closeConnection);
process.once("SIGTERM", closeConnection);
