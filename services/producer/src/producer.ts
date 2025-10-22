import { createConnection, closeConnection } from "@message/rabbitmq";
import { ChunkMessage } from "@message/types/chunk-message";
import { logger } from "@shared/logger";
import { readFileFromBuffer } from "@shared/utils";
import pLimit from "p-limit";
import Connection, { Publisher } from "rabbitmq-client";

const CHUNK_SIZE = 1000;
const CHUNKS_QUEUE = "chunks";
const CHUNKS_EMIT_SIZE = 10;

function initProducer() {
  const connection = createConnection();
  const publisher = connection.createPublisher({
    confirm: true,
    maxAttempts: 3,
    exchanges: [{ exchange: CHUNKS_QUEUE, type: "fanout", durable: true }],
  });

  process.once("SIGINT", closeConnection);
  process.once("SIGTERM", closeConnection);
  logger().info("✅ Producer connected to RabbitMQ");

  return { connection, publisher };
}

async function publishChunk(
  publisher: Publisher,
  chunkId: string,
  lines: string[]
) {
  const message: ChunkMessage = {
    chunkId,
    lines,
  };

  await publisher.send(
    { exchange: CHUNKS_QUEUE, routingKey: "chunk.ready", durable: true },
    message
  );

  logger().info(`📦 Sent chunk ${chunkId} (${message.lines.length} lines)`);
}

export async function producer(buffer: Buffer) {
  const { publisher } = initProducer();

  const limit = pLimit(CHUNKS_EMIT_SIZE);

  const chunks = readFileFromBuffer(buffer, CHUNK_SIZE);

  const chunkId = crypto.randomUUID();

  const tasks: Promise<void>[] = [];

  for await (const chunk of chunks) {
    tasks.push(
      limit(async () => await publishChunk(publisher, chunkId, chunk))
    );
  }

  await Promise.all(tasks);
  logger().info(`✅ Finished sending all chunks for ${chunkId}`);
}
