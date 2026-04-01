# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  AI — Docker Image                                                           ║
# ║                                                                              ║
# ║  Build:  docker build -t ai .                                                ║
# ║  Run:    docker run -it --rm -e ANTHROPIC_API_KEY=... ai                     ║
# ║                                                                              ║
# ║  Multi-stage build for minimal production image.                             ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

# ── Stage 1: Build ──
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# Copy source files
COPY . .

# ── Stage 2: Production ──
FROM node:22-slim AS production

# Install system dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      git \
      sqlite3 \
      sox \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy from builder
COPY --from=builder /app /app

# Create data directories
RUN mkdir -p /root/.local/share/ai \
             /root/.cache/ai/responses \
             /root/.config/ai

# Environment
ENV NODE_ENV=production

# Default entrypoint
ENTRYPOINT ["node", "src/entrypoints/cli.tsx"]
CMD ["--help"]
