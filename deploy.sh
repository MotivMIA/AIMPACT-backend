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
 docker build --platform linux/amd64 -t xnr-backend:amd64 . || {
   echo "Error: Docker build failed. Check disk space, Docker configuration, or build context."
   exit 1
 }

 echo "Tagging and pushing to Docker Hub..."
 docker tag xnr-backend:amd64 "$DOCKERHUB_USERNAME/xnr-backend:amd64" || {
   echo "Error: Docker tag failed."
   exit 1
 }
 docker push "$DOCKERHUB_USERNAME/xnr-backend:amd64" || {
   echo "Error: Docker push failed. Ensure you are logged in with 'docker login'."
   exit 1
 }

 echo "Deploying to Render..."
 curl -X POST \
   -H "Authorization: Bearer $RENDER_API_KEY" \
   -H "Content-Type: application/json" \
   -d "{\"serviceId\": \"$RENDER_SERVICE_ID\", \"image\": \"$DOCKERHUB_USERNAME/xnr-backend:amd64\"}" \
   https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys || {
   echo "Error: Render deployment failed. Verify RENDER_API_KEY and RENDER_SERVICE_ID."
   exit 1
 }

 echo "Deployment triggered!"

chmod +x deploy.sh
# Create deploy.env file if it doesn't exist