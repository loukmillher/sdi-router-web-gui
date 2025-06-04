#!/bin/bash

echo "Starting SDI Router in DEMO mode..."
echo ""
echo "⚠️  DEMO MODE - No VideoHub hardware required"
echo "   This mode simulates a Blackmagic VideoHub for UI testing"
echo ""

# Check if secure mode is requested
SECURE_MODE=""
if [ "$1" = "--secure" ] || [ "$1" = "-s" ]; then
  SECURE_MODE="true"
  echo "🔒 Running in SECURE mode (HTTPS/WSS)"
else
  echo "🔓 Running in standard mode (HTTP/WS)"
  echo "   Use './start-demo.sh --secure' for HTTPS/WSS mode"
fi
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

# Check if certificates exist for secure mode
if [ "$SECURE_MODE" = "true" ]; then
  cd server
  if [ ! -f "certs/server.cert" ] || [ ! -f "certs/server.key" ]; then
    echo "⚠️  SSL certificates not found!"
    echo "   Running: npm run generate-cert"
    npm run generate-cert
    echo ""
  fi
  cd ..
fi

# Start server in background with demo mode
cd server
if [ "$SECURE_MODE" = "true" ]; then
  DEMO_MODE=true USE_SSL=true npm run dev &
else
  DEMO_MODE=true npm run dev &
fi
SERVER_PID=$!
echo "✓ Demo server started (PID: $SERVER_PID)"

# Wait a moment for server to start
sleep 3

# Start client in background
cd ../client
if [ "$SECURE_MODE" = "true" ]; then
  REACT_APP_WS_URL=wss://localhost:3001 npm start &
else
  npm start &
fi
CLIENT_PID=$!
echo "✓ Client started (PID: $CLIENT_PID)"

echo ""
echo "🎉 Demo mode is running!"
if [ "$SECURE_MODE" = "true" ]; then
  echo "   Open https://localhost:3000 to view the interface"
  echo "   ⚠️  Browser will show certificate warning - this is normal for self-signed certs"
else
  echo "   Open http://localhost:3000 to view the interface"
fi
echo ""

# Wait for both processes
wait $SERVER_PID $CLIENT_PID