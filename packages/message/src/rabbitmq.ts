import { Connection } from "rabbitmq-client";
import { logger } from "../../shared/src/logger";

let connection: Connection | null = null;

export function createConnection() {
  if (!connection) {
    connection = new Connection({
      url: `amqp://guest:guest@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,
      connectionName: `${process.env.RABBITMQ_HOST}`,
      hostname: `${process.env.RABBITMQ_HOST}`,
      hosts: [`${process.env.RABBITMQ_HOST}`],
      connectionTimeout: 30000,
      vhost: `${process.env.RABBITMQ_HOST}`,
      password: process.env.RABBITMQ_PASSWORD,
      username: process.env.RABBITMQ_USER,
      port: process.env.RABBITMQ_PORT,
    });
  }

  return connection;
}

export async function closeConnection() {
  if (!connection) return;

  logger().info("Closing RabbitMQ connection...");
  await connection.close();
  connection = null;
}
