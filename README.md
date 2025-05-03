# AIM Backend

Backend for the AIM Crypto project.

## Setup
Run `./rebuild-aim-backend.sh [--no-prompt] [--quiet] [--build]` to set up the project.

## Run
- Development: `npm run dev`
- API Docs: `http://localhost:5001/api-docs`
- Health Check: `http://localhost:5001/api/health`

## Features
- JWT & 2FA Authentication
- Transaction Management
- Rate Limiting
- MongoDB with AWS Secrets Manager
