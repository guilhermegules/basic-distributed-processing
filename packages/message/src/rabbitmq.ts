import { Connection } from "rabbitmq-client";
import { logger } from "../../shared/src/logger";

let connection: Connection | null = null;

export function createConnection() {
  if (!connection) {
    connection = new Connection({
      url: "amqp://guest:guest@rabbitmq:5672",
      connectionName: "rabbitmq",
      hostname: "rabbitmq",
      hosts: ["rabbitmq"],
      connectionTimeout: 30000,
      vhost: "rabbitmq",
      password: "guest",
      username: "guest",
      port: "5672",
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
