# Development stage
FROM node:20-alpine as development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle vite-plugin-pwa compatibility
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle vite-plugin-pwa compatibility
RUN npm ci --legacy-peer-deps && npm cache clean --force

# Copy source code
COPY . .

# Set production environment
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.25-alpine as production

# Install security updates and tools
RUN apk update && apk add --no-cache \
    openssl \
    curl \
    && rm -rf /var/cache/apk/*

# Create nginx user and group
RUN addgroup -g 101 -S nginx || true
RUN adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.default

# Create nginx directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp \
    && mkdir -p /var/run/nginx \
    && chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && chown -R nginx:nginx /etc/nginx/conf.d \
    && chown -R nginx:nginx /var/run/nginx \
    && chmod 755 /var/run/nginx

# Update nginx.conf to use non-root user
RUN sed -i 's/user nginx;/user nginx;/' /etc/nginx/nginx.conf || true
RUN sed -i '1i pid /var/run/nginx/nginx.pid;' /etc/nginx/nginx.conf

# Switch to non-root user
USER nginx

# Expose ports
EXPOSE 80 443

# Add health check - use HTTPS and check backend health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f -k https://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]