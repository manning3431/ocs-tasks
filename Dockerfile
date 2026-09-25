# syntax = docker/dockerfile:1.4
# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install git for git dependencies
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies with BuildKit secret for private GitHub packages
RUN --mount=type=secret,id=github_token \
  npm ci --prefer-offline --no-audit --no-fund

# Copy source
COPY . .

# Build production bundle
RUN npm run build

# Production stage - nginx
FROM nginx:alpine AS runner

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check endpoint
RUN mkdir -p /usr/share/nginx/html/health && echo 'ok' > /usr/share/nginx/html/health/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]