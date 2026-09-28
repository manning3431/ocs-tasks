# shell/Dockerfile
# syntax = docker/dockerfile:1.4
FROM node:20-slim AS builder

WORKDIR /app

# Install git + ssh client + ca-certificates
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    openssh-client \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Configure git EARLY - before any git operations
RUN git config --global url."https://github.com/".insteadOf "git@github.com:" \
 && git config --global url."https://github.com/".insteadOf "ssh://git@github.com/" \
 && git config --global credential.helper '!f() { echo "username=git"; echo "password=$GIT_TOKEN"; }; f'

# Copy package files
COPY package.json package-lock.json* ./

# Install with BuildKit secret - export token for git credential helper
RUN --mount=type=secret,id=github_token \
  export GIT_TOKEN="$(cat /run/secrets/github_token)" && \
  npm ci --prefer-offline --no-audit --no-fund && \
  # 💡 FIX: Manually inject the exact binary Rollup needs for this Linux container layout
  npm install @rollup/rollup-linux-x64-gnu --no-save

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM nginx:alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
RUN mkdir -p /usr/share/nginx/html/health && echo 'ok' > /usr/share/nginx/html/health/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
