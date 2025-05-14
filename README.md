# AIM Backend

Backend for the AIM Crypto project.

## Setup
Run the setup scripts from the parent directory (e.g., ~/Documents/projects/scripts):

- Full setup: `./scripts/master.sh`
- Setup only: `./scripts/master.sh setup`
- MongoDB setup only: `./scripts/master.sh mongo`
- Verification only: `./scripts/master.sh verify`

Use `--debug` for verbose output (e.g., `./master.sh --debug`).

Scripts should be stored outside the project directory (e.g., ~/Documents/projects/scripts) to avoid being overwritten.

## Run
- Development: `npm run dev`
- API Docs: http://localhost:5001/api/v1/docs
- Health Check: http://localhost:5001/api/v1/health
- Metrics: http://localhost:5001/api/v1/metrics
- WebSocket: ws://localhost:5001

## Deployment
Run `./deploy.sh` with `deploy.env` configured for Docker Hub and Render.

## Features
- JWT & 2FA Authentication
- Transaction Management with Status Updates
- Configurable Rate Limiting
- MongoDB with AWS Secrets Manager
- Prometheus Metrics
- Request Logging
- API Versioning (v1)
- WebSocket for Real-Time Notifications
- Paginated Transaction History

# XNR Backend
Backend URL: https://xnr-backend.onrender.com
