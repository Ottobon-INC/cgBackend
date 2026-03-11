# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package info
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# Copy package.json to install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Keep public folder in case backend serves images/static files locally
# Create it if it doesn't exist to prevent copy errors
RUN mkdir -p ./public
COPY --from=builder /app/public ./public

# Environment configuration
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start compiled server
CMD ["npm", "start"]
