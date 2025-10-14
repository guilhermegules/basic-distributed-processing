# 📫 Distributed Processing System

This project demonstrates a distributed processing system built with Node.js, RabbitMQ, and Docker Compose - designed to handle large-scale data processing tasks using a producer-consumer architecture and is organized as a monorepo managed by pnpm.

## System:

1. Distributor (Producer) - reads file, splits in chunks, sends to queue
2. Workers (Consumers) - consume chunks, compute partial sum
3. Collector - receives partial sums and computes final result

Example:

```
large_file.txt
⇣
Distributor → RabbitMQ queue (e.g. "chunks")
⇣
Workers consume "chunks" queue → produce results to "results" queue
⇣
Collector consumes "results" queue >> sums all partials >> prints total
```

## Running

### 1 Prerequisites

- Docker + Docker Compose
- pnpm (npm i -g pnpm)
- Copy the `.env.example` to `.env`

### 2 Prepare test file

```bash
node -e "console.log(Array(20000).fill(0).map(()=>Array(200).fill(Math.floor(Math.random() * 1000)).join(' ')).join('\n'))" > data/large-file.txt
```

### 3 Build and Start All Services

- docker compose up --build

### 4 Access the Services

| Service        | URL                                              | Description                |
| -------------- | ------------------------------------------------ | -------------------------- |
| RabbitMQ UI    | [http://localhost:15672](http://localhost:15672) | Queue management dashboard |
| Producer Logs  | `docker logs producer`                           | Shows publishing messages  |
| Worker Logs    | `docker logs worker`                             | Shows processing messages  |
| Collector Logs | `docker logs collector`                          | Shows collector messages   |

- You’ll see the queues:
  - chunks -> used by producer -> consumed by workers
  - results -> used by workers -> consumed by collector

### 🧰 Development Commands

```bash
# Install dependencies
pnpm install

# Run all services locally
pnpm start --filter ./services/producer
pnpm start --filter ./services/worker
pnpm start --filter ./services/collector

# Build
pnpm run build
```

## 📜 License

MIT License © 2025 — Guilherme Gules Moreira
