# Use Node 22 Alpine for smaller image size
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy generated Prisma Client from custom location
COPY --from=builder /app/.generated ./.generated

# Generate Prisma Client in production
RUN npx prisma generate

# Expose the application port (adjust if needed)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]