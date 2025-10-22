import { createConnection, closeConnection } from "@message/rabbitmq";
import { ChunkMessage } from "@message/types/chunk-message";
import { logger } from "@shared/logger";
import { readFileFromBuffer } from "@shared/utils";

const CHUNK_SIZE = 1000;
const CHUNKS_QUEUE = "chunks";

export async function producer(buffer: Buffer) {
  const connection = createConnection();

  const publisher = connection.createPublisher({
    confirm: true,
    maxAttempts: 3,
    exchanges: [{ exchange: CHUNKS_QUEUE, type: "fanout", durable: true }],
  });

  const chunks = readFileFromBuffer(buffer, CHUNK_SIZE);

  const chunkId = crypto.randomUUID();

  for await (const chunk of chunks) {
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

process.once("SIGINT", closeConnection);
process.once("SIGTERM", closeConnection);
