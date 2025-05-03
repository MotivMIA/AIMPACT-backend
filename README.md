# AIM Backend

Backend for the AIM Crypto project.

## Setup
Run `./rebuild-aim-backend.sh [--no-prompt] [--quiet] [--build]` to set up the project.

## Run
- Development: `npm run dev`
- API Docs: `http://localhost:5001/api/v1/docs`
- Health Check: `http://localhost:5001/api/v1/health`
- Metrics: `http://localhost:5001/api/v1/metrics`

## Deployment
Run `./deploy.sh` with `deploy.env` configured for Docker Hub and Render.

## Features
- JWT & 2FA Authentication
- Transaction Management
- Rate Limiting
- MongoDB with AWS Secrets Manager
- Prometheus Metrics
- Request Logging
- API Versioning (v1)
