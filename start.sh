#!/bin/bash

echo "Starting SDI Router..."

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "Creating .env file from template..."
    cp server/.env.example server/.env
    echo "Please edit server/.env with your VideoHub IP address"
    exit 1
fi

# Start production server
cd server
NODE_ENV=production npm start