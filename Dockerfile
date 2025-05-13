# Build stage
FROM --platform=$BUILDPLATFORM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM --platform=$TARGETPLATFORM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
RUN npm install --production
ENV PORT=10000
EXPOSE 10000
CMD ["npm", "start"]
# docker buildx build --platform linux/amd64,linux/arm64 -t xnr-backend:latest .