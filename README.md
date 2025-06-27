# Blackmagic SDI Router Web Control

A professional web-based control interface for Blackmagic Smart Videohub SDI routers, implementing the official Blackmagic Router Control Protocol over TCP/WebSocket bridge.

## Features

- **🎛️ 120x120 Matrix Support**: Full support for large-scale routing matrices up to 120 inputs and 120 outputs
- **🎯 Dual-Mode Interface**: Optimized UI for managing large matrices
  - **Select Mode**: Choose output first, then input from filtered grid  
  - **Overview Mode**: View all active routes in compact list format
- **🔍 Advanced Search**: Filter inputs and outputs by name or number for quick navigation
- **⚡ Real-time Updates**: WebSocket-based communication for instant route changes
- **📋 Smart Presets**: Create and manage complex multi-route configurations
- **🌙 Professional UI**: Dark theme interface optimized for broadcast environments
- **🔄 Auto-reconnection**: Robust connection handling with exponential backoff
- **🎭 Demo Mode**: Full UI testing without VideoHub hardware

## Quick Start

### Option 1: Demo Mode (Recommended)
No VideoHub hardware required - perfect for testing the interface:

```bash
./LAUNCH.sh
# Choose option 1 for demo mode
```

Then open: **http://localhost:3000**

### Option 2: One-Command Setup
```bash
# Install, build, and start in demo mode
./start-demo.sh
```

## Requirements

- **Node.js 14+**: Required for both client and server
- **npm**: For dependency management  
- **Network Access**: For VideoHub communication (port 9990)
- **Blackmagic Smart Videohub**: Any model supporting Router Control Protocol

## Setup Options

### Automated Setup (Recommended)
Use the interactive launcher for guided setup:

```bash
./LAUNCH.sh
```

Choose from:
- **🎭 Demo Mode**: No hardware required, mock VideoHub
- **🔧 Development Mode**: Hot reload, connects to real VideoHub  
- **🚀 Production Mode**: Optimized build for deployment
- **🛠️ Build Only**: Install dependencies and build

### Manual Setup

#### 1. Install Dependencies
```bash
./build.sh  # Installs both client and server dependencies
```

#### 2. Configure VideoHub Connection
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit with your VideoHub IP address
nano server/.env
```

Set your VideoHub configuration:
```env
VIDEOHUB_HOST=192.168.1.100
VIDEOHUB_PORT=9990
```

#### 3. Start Application

**Development Mode:**
```bash
./start-dev.sh  # Runs client and server with hot reload
```

**Production Mode:**
```bash
./start.sh      # Runs optimized production build
```

**Demo Mode:**
```bash
./start-demo.sh # Runs with mock VideoHub for testing
```

## Usage Guide

### Interface Overview
The application opens at **http://localhost:3000** with two main modes:

#### Select Mode (Default)
1. **Choose Output**: Select destination from the searchable output list
2. **Pick Input**: Choose source from the filtered input grid  
3. **Apply Route**: Changes are applied instantly
4. **Visual Feedback**: Active routes highlighted in green

#### Overview Mode
1. **View All Routes**: Click "View All Routes" for complete routing status
2. **Compact List**: See all active connections at once
3. **Quick Changes**: Click any route to modify it

### Key Features

#### 🔍 Advanced Search
- **Filter by Name**: Type input/output labels for quick finding
- **Filter by Number**: Enter channel numbers for direct access
- **Smart Results**: Limited display for performance with large matrices

#### 📋 Preset Management
- **Create Presets**: Save current routing as named configurations
- **Apply Presets**: One-click application of complex routing setups
- **Edit Presets**: Modify existing preset configurations
- **Preset Categories**: Organize presets for different scenarios

#### ⚡ Real-time Operations
- **Live Updates**: Changes from other control sources appear instantly
- **Connection Status**: Clear indicators for VideoHub connectivity
- **Auto-sync**: Labels and routes sync automatically from VideoHub

### Protocol Implementation

This application implements the **Blackmagic Router Control Protocol** as documented in the Blackmagic VideoHub documentation:

- **TCP Connection**: Direct connection to VideoHub on port 9990
- **Text-based Protocol**: Human-readable ASCII commands
- **Command Structure**: Follows official Blackmagic protocol specification
- **ACK Handling**: Proper acknowledgment processing for reliable operation

For detailed protocol information, see: `Documentation/PROTOCOL-IMPLEMENTATION.md`

## Architecture

### System Components
- **Client**: React SPA with Tailwind CSS and responsive design
- **Server**: Node.js Express + WebSocket server
- **Bridge**: TCP-to-WebSocket protocol translation layer
- **Protocol**: Full Blackmagic Router Control Protocol implementation

### Data Flow
```
VideoHub (TCP:9990) ↔ Node.js Server ↔ WebSocket ↔ React Client
```

### Supported VideoHub Models
- Smart Videohub 12x12, 20x20, 40x40
- Universal Videohub 72, 288, 450
- Any VideoHub supporting Router Control Protocol

## Troubleshooting

### Connection Issues
- **VideoHub Network**: Ensure VideoHub is accessible on your network
- **Firewall**: Allow ports 3000 (client), 3001 (server), 9990 (VideoHub)
- **IP Configuration**: Verify VideoHub IP in `server/.env`
- **Protocol Test**: Run `node server/test-protocol.js` to test direct connection

### Performance Issues
- **Large Matrices**: Use search functionality for 120x120 matrices
- **Browser**: Modern browsers recommended for WebSocket support
- **Network**: Stable network connection required for real-time updates

### Development Issues
- **Dependencies**: Run `./build.sh` to reinstall all dependencies
- **Ports in Use**: Change ports in `server/.env` if conflicts occur
- **Cache Issues**: Clear browser cache and npm cache if needed

### Getting Help
- **Demo Mode**: Use `./start-demo.sh` to test UI without hardware
- **Logs**: Check browser console and server terminal for error messages
- **Documentation**: See `Documentation/` folder for detailed guides

## Attribution

This project uses the **Blackmagic Router Control Protocol**, which is the official protocol for controlling Blackmagic Design VideoHub routers. Blackmagic Design and VideoHub are trademarks of Blackmagic Design Pty Ltd. This project is not affiliated with or endorsed by Blackmagic Design.

For protocol details, see the official Blackmagic documentation.

## License

This project is licensed under the [MIT License](LICENSE).