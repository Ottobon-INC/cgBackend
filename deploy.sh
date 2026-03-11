#!/bin/bash
# Helper script to deploy or update the backend stack

echo "Building and starting the Backend Docker container..."

# Ensure .env exists
if [ ! -f .env ]; then
  echo "Error: .env file not found! Please copy .env.example to .env and fill in the values."
  exit 1
fi

# Build the containers (pulls new code/changes into the image)
docker compose build

# Start the containers in detached mode
docker compose up -d

echo "✅ Backend deployed successfully!"
echo "➡️ API running on: http://localhost:3000"
