#!/bin/bash

echo "Building SDI Router application..."

# Check if we're in the right directory
if [ ! -d "client" ] && [ ! -d "server" ]; then
    echo "Please run this script from the sdi-router directory"
    exit 1
fi

# Install server dependencies
cd server
echo "Installing server dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Server dependencies installed"
else
    echo "✗ Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
cd ../client
echo "Installing client dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Client dependencies installed"
else
    echo "✗ Failed to install client dependencies"
    exit 1
fi

# Build client for production
echo "Building client for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✓ Client built successfully"
else
    echo "✗ Failed to build client"
    exit 1
fi

cd ..

echo ""
echo "Build completed successfully!"
echo ""
echo "Next steps:"
echo "1. For development: ./start-dev.sh"
echo "2. For production: ./start.sh"