FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copy workspace manifests first for caching
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages ./packages
COPY services ./services
COPY data/large-file.txt ./data/large-file.txt

# Install dependencies for the whole workspace
RUN pnpm install

# Default command: run the producer (can override in docker-compose)
CMD ["pnpm", "start"]
