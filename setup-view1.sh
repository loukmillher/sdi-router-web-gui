#!/bin/bash

echo "Setting up View 1 implementation..."

# Install client dependencies including Heroicons
cd client
echo "Installing client dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "✓ Client dependencies installed successfully"
else
    echo "✗ Failed to install client dependencies"
    exit 1
fi

echo ""
echo "View 1 setup complete!"
echo ""
echo "To start the application:"
echo "1. Terminal 1: cd server && npm run dev"
echo "2. Terminal 2: cd client && npm start"
echo ""
echo "View 1 features implemented:"
echo "• Header with navigation tabs and connection status"
echo "• Destinations view with scrollable list of 120 outputs"
echo "• Individual destination cards with output info and controls"
echo "• Lock/unlock functionality for outputs"
echo "• Change source modal with search and input selection"
echo "• Footer with connection info and save configuration"
echo "• Dark theme optimized for control room environments"