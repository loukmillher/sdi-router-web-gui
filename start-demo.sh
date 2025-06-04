#!/bin/bash

echo "Starting SDI Router in DEMO mode..."
echo ""
echo "⚠️  DEMO MODE - No VideoHub hardware required"
echo "   This mode simulates a Blackmagic VideoHub for UI testing"
echo ""

# Check if we're in the right directory
if [ ! -d "client" ] && [ ! -d "server" ]; then
    echo "Please run this script from the sdi-router directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "Dependencies not found. Installing..."
    ./build.sh
fi

# Set demo mode environment variable
export DEMO_MODE=true
export VIDEOHUB_HOST=localhost
export VIDEOHUB_PORT=9990

echo ""
echo "🚀 Starting demo servers..."
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Demo features:"
echo "  • Simulated routing changes"
echo "  • Mock VideoHub responses"
echo "  • All UI functionality working"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Create a trap to handle Ctrl+C and kill both processes
trap 'echo ""; echo "Stopping demo servers..."; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit' INT

# Start server in background with demo mode
cd server
DEMO_MODE=true npm run dev &
SERVER_PID=$!
echo "✓ Demo server started (PID: $SERVER_PID)"

# Wait a moment for server to start
sleep 3

# Start client in background
cd ../client
npm start &
CLIENT_PID=$!
echo "✓ Client started (PID: $CLIENT_PID)"

echo ""
echo "🎉 Demo mode is running!"
echo "   Open http://localhost:3000 to view the interface"
echo ""

# Wait for both processes
wait $SERVER_PID $CLIENT_PID