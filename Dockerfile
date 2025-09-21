# Multi-stage build for Language Learning AI Companion
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat ffmpeg

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/next-env.d.ts ./frontend/

# Install root dependencies (includes concurrently)
RUN npm ci

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules

# Copy source code
COPY . .

# Build the frontend application
WORKDIR /app/frontend
RUN npm run build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

# Install runtime dependencies including FFmpeg for audio processing
RUN apk add --no-cache ffmpeg

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/backend ./backend
COPY --from=builder --chown=nextjs:nodejs /app/frontend/.next ./frontend/.next
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=builder /app/frontend/package*.json ./frontend/
COPY --from=builder /app/frontend/next.config.* ./frontend/
COPY --from=builder /app/frontend/public ./frontend/public

# Copy additional configuration files
COPY --from=builder /app/postcss.config.mjs ./
COPY --from=builder /app/tailwind.config.js ./
COPY --from=builder /app/tsconfig.json ./

# Create uploads directory for backend
RUN mkdir -p backend/uploads && chown -R nextjs:nodejs backend/uploads

# Switch to non-root user
USER nextjs

# Expose the ports
EXPOSE 3000 5000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV FRONTEND_PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node backend/healthcheck.js || exit 1

# Start both frontend and backend using concurrently
CMD ["npm", "run", "start:docker"]