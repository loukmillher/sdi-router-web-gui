#!/bin/bash

echo "Starting SDI Router in development mode..."

# Check if we're in the right directory
if [ ! -d "client" ] && [ ! -d "server" ]; then
    echo "Please run this script from the sdi-router directory"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "server/node_modules" ]; then
    echo "Server dependencies not found. Please run ./build.sh first"
    exit 1
fi

if [ ! -d "client/node_modules" ]; then
    echo "Client dependencies not found. Please run ./build.sh first"
    exit 1
fi

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Create a trap to handle Ctrl+C and kill both processes
trap 'echo ""; echo "Stopping servers..."; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit' INT

# Start server in background
cd server
npm run dev &
SERVER_PID=$!
echo "✓ Server started (PID: $SERVER_PID)"

# Wait a moment for server to start
sleep 2

# Start client in background
cd ../client
npm start &
CLIENT_PID=$!
echo "✓ Client started (PID: $CLIENT_PID)"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID