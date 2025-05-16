# Build stage
FROM --platform=$BUILDPLATFORM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && ls -la /app/dist/

# Production stage
FROM --platform=$TARGETPLATFORM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN ls -la /app/dist/ && npm install --production
ENV PORT=10000
EXPOSE 10000
CMD ["npm", "start"]
# docker buildx build --platform linux/arm64,linux/amd64 -t xrs-backend:latest .