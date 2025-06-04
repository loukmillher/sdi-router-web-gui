# Quick Start Guide - SDI Router Web Interface

## 🚀 View the UI Locally

### Option 1: Demo Mode (Recommended for UI Testing)
**No VideoHub hardware required!**

```bash
# Run this single command to see the full UI
./start-demo.sh
```

Then open: **http://localhost:3000**

### Option 2: Development Mode
```bash
# 1. Build the project first
./build.sh

# 2. Start development servers
./start-dev.sh
```

Then open: **http://localhost:3000**

### Option 3: Production Mode
```bash
# 1. Build the project
./build.sh

# 2. Start production server
./start.sh
```

Then open: **http://localhost:3001**

## 📱 What You'll See

### View 1: Routing Matrix & Control
- **120 output destinations** in a scrollable list
- **Lock/unlock** individual outputs
- **Change source** modal with search functionality
- **Real-time routing updates**
- **Professional dark theme**

### View 2: Preset Management
- **Create/edit presets** from current routes
- **Apply presets** with one click
- **Duplicate and manage** preset configurations
- **Search presets** by name
- **Route preview** for each preset

## 🎛️ Features to Test

### Routing Operations
1. Click "Change Source" on any output
2. Search for inputs by name or number
3. Apply routing changes
4. Lock/unlock outputs to prevent changes

### Preset Management
1. Switch to "PRESETS" tab
2. Create a new preset from current routes
3. Apply different presets and see changes
4. Edit existing presets

### Demo Mode Features
- **Simulated VideoHub** - no hardware needed
- **Mock routing responses** - all UI features work
- **Default labels** - cameras, monitors, recording feeds
- **Pre-configured routes** - sample routing to explore

## 🔧 Troubleshooting

### If build fails:
```bash
# Check Node.js version (requires 14+)
node --version

# Clear npm cache if needed
npm cache clean --force
```

### If ports are in use:
- Frontend: Change port in `client/package.json` 
- Backend: Change PORT in `server/.env`

### If demo mode doesn't work:
```bash
# Try regular development mode
./start-dev.sh
```

## 📂 Project Structure
```
sdi-router/
├── client/          # React frontend
├── server/          # Node.js backend
├── start-demo.sh    # Demo mode (recommended)
├── start-dev.sh     # Development mode
├── build.sh         # Build script
└── start.sh         # Production mode
```

## 🎯 Next Steps

After viewing the UI:
1. **Test all features** in demo mode
2. **Configure for real VideoHub** in `server/.env`
3. **Deploy to production** using `./build.sh && ./start.sh`

The interface is fully functional and ready for professional broadcast environments!