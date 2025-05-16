#!/bin/bash

set -e

# Source deploy.env
if [ -f "deploy.env" ]; then
  set -a
  source deploy.env
  set +a
else
  echo "Error: deploy.env not found. Please create it with DOCKERHUB_USERNAME, RENDER_API_KEY, and RENDER_SERVICE_ID."
  exit 1
fi

# Validate environment variables
if [ -z "$DOCKERHUB_USERNAME" ] || [ -z "$RENDER_API_KEY" ] || [ -z "$RENDER_SERVICE_ID" ]; then
  echo "Error: DOCKERHUB_USERNAME, RENDER_API_KEY, and RENDER_SERVICE_ID must be set in deploy.env."
  exit 1
fi

echo "Building Docker image..."
docker buildx build --platform linux/amd64,linux/arm64 -t "$DOCKERHUB_USERNAME/xrs-backend:latest" --push . || {
  echo "Error: Docker build failed. Check Dockerfile, disk space, or Docker configuration."
  exit 1
}

echo "Deploying to Render..."
curl -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"image\":{\"ref\":\"$DOCKERHUB_USERNAME/xrs-backend:latest\"}}" \
  https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys || {
  echo "Error: Render deployment failed. Verify RENDER_API_KEY and RENDER_SERVICE_ID."
  exit 1
}

echo "Deployment triggered!"