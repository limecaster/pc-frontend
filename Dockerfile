FROM node:20 AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Create default next.config.js if it doesn't exist
RUN if [ ! -f next.config.js ] && [ ! -f next.config.mjs ]; then \
      echo "/** @type {import('next').NextConfig} */\nconst nextConfig = {};\nmodule.exports = nextConfig;" > next.config.js; \
    fi

# Build application
RUN npm run build

# Production image
FROM node:20 AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy Next.js config files if they exist
COPY --from=builder /app/next.config.js* ./

# Expose the port Next.js runs on
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
