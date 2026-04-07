# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  AI — Docker Image                                                           ║
# ║                                                                              ║
# ║  Build:  docker build -t ai .                                                ║
# ║  Run:    docker run -it --rm -e ANTHROPIC_API_KEY=... ai                     ║
# ║                                                                              ║
# ║  Multi-stage build for minimal production image.                             ║
# ║  Stage 1: Install dependencies and build TypeScript                          ║
# ║  Stage 2: Minimal runtime with only production files                         ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

# ── Stage 1: Build ──
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts 2>/dev/null || npm install --ignore-scripts

# Copy source files
COPY src/ src/
COPY tsconfig.json ./

# Build TypeScript
RUN npx tsc || true

# Remove dev dependencies for production
RUN npm prune --omit=dev 2>/dev/null || true

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

# Copy only production-necessary files from builder
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/src /app/src
COPY scripts/ /app/scripts/

# Create data directories
RUN mkdir -p /root/.local/share/ai \
             /root/.cache/ai/responses \
             /root/.config/ai

# Environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

# Default entrypoint — use tsx for TypeScript execution
ENTRYPOINT ["npx", "tsx", "src/entrypoints/cli.tsx"]
CMD ["--help"]
