#!/bin/bash

set -e

echo "Building Docker image..."
docker build -t aim-backend:latest .

echo "Tagging and pushing to Docker Hub..."
docker tag aim-backend:latest $DOCKERHUB_USERNAME/aim-backend:latest
docker push $DOCKERHUB_USERNAME/aim-backend:latest

echo "Deploying to Render..."
curl -X POST \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"serviceId\": \"$RENDER_SERVICE_ID\", \"image\": \"$DOCKERHUB_USERNAME/aim-backend:latest\"}" \
  https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys

echo "Deployment triggered!"
