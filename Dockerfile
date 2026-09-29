# ==========================================
# Stage 1: Build Stage (Node.js)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors for cached dependency installation
COPY package.json package-lock.json ./

# Install exact dependencies reproducibly
RUN npm ci

# Optional build-time argument for backend API URL
# Defaults to '/api' (relative path, ideal for reverse proxy)
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Copy application source code
COPY . .

# Build production bundle (outputs to /app/dist)
RUN npm run build

# ==========================================
# Stage 2: Production Stage (Nginx)
# ==========================================
FROM nginx:1.27-alpine

# Set working directory to Nginx html folder
WORKDIR /usr/share/nginx/html

# Remove default Nginx static files
RUN rm -rf ./*

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build artifacts from builder stage
COPY --from=builder /app/dist ./

# Expose standard HTTP port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
