FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy only what's needed for install first (for better caching)
COPY pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY services/producer/package.json ./services/producer/package.json

# Install only this service's deps + shared packages
RUN pnpm install --filter "./services/producer" --prod

# Copy source files
COPY services/producer/src ./services/producer/src

# Set workdir to this service
WORKDIR /app/services/producer

CMD ["pnpm", "start"]
