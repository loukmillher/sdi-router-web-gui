#!/bin/bash

echo "🎬 Blackmagic SDI Router Web Interface"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -d "client" ] && [ ! -d "server" ]; then
    echo "❌ Please run this script from the sdi-router directory"
    exit 1
fi

echo "Choose your option:"
echo ""
echo "1) 🎭 DEMO MODE (Recommended for UI testing)"
echo "   • No VideoHub hardware required"
echo "   • Mock server simulates all functionality"
echo "   • Perfect for exploring the interface"
echo ""
echo "2) 🔧 DEVELOPMENT MODE"
echo "   • Hot reload for development"
echo "   • Requires VideoHub hardware or mock server"
echo ""
echo "3) 🚀 PRODUCTION MODE"
echo "   • Optimized build for deployment"
echo "   • Single server serves everything"
echo ""
echo "4) 🛠️  BUILD ONLY"
echo "   • Just install dependencies and build"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎭 Starting DEMO MODE..."
        echo ""
        echo "This will:"
        echo "• Install all dependencies"
        echo "• Start a mock VideoHub server"
        echo "• Launch the web interface"
        echo ""
        read -p "Continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            ./build.sh && ./start-demo.sh
        fi
        ;;
    2)
        echo ""
        echo "🔧 Starting DEVELOPMENT MODE..."
        echo ""
        echo "This will:"
        echo "• Install all dependencies"
        echo "• Start development servers with hot reload"
        echo "• Connect to real VideoHub (configure in server/.env)"
        echo ""
        read -p "Continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            ./build.sh && ./start-dev.sh
        fi
        ;;
    3)
        echo ""
        echo "🚀 Starting PRODUCTION MODE..."
        echo ""
        echo "This will:"
        echo "• Build optimized production version"
        echo "• Start single production server"
        echo "• Connect to real VideoHub"
        echo ""
        read -p "Continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            ./build.sh && ./start.sh
        fi
        ;;
    4)
        echo ""
        echo "🛠️  BUILDING PROJECT..."
        ./build.sh
        echo ""
        echo "Build complete! You can now run:"
        echo "  ./start-demo.sh  (for demo mode)"
        echo "  ./start-dev.sh   (for development)"
        echo "  ./start.sh       (for production)"
        ;;
    *)
        echo ""
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac