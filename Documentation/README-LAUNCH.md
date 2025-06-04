# 🚀 Launch Your SDI Router Web Interface

## Quick Start (3 Simple Steps)

### 1. Navigate to the Project
```bash
cd "/Users/loukmillher/Documents/Development/Projects/Active/Blackmagic SDI Web GUI/sdi-router"
```

### 2. Run the Launch Script
```bash
./LAUNCH.sh
```

### 3. Choose Demo Mode (Option 1)
- Select option **1** for demo mode
- No VideoHub hardware needed
- Perfect for exploring the UI

### 4. Open Your Browser
Visit: **http://localhost:3000**

## 🎯 What You'll See

### Professional SDI Router Interface
- **Dark theme** optimized for control rooms
- **120x120 matrix support** with scalable UI
- **Two main views** accessible via top navigation tabs

### View 1: Routing Matrix & Control
- **120 destination outputs** in scrollable list
- **Change Source** button opens input selection modal
- **Lock/Unlock** outputs to prevent accidental changes
- **Search functionality** to find inputs quickly
- **Real-time routing updates**

### View 2: Preset Management
- **Create presets** from current routing configuration
- **Apply presets** with one-click activation
- **Edit/duplicate/delete** preset management
- **Route preview** showing first 3 routes + count
- **Search presets** by name

## 🎛️ Interactive Features

### Try These Actions:
1. **Switch between tabs** - click ROUTING/PRESETS in header
2. **Change a route** - click "Change Source" on any output
3. **Search inputs** - use the search bar in the modal
4. **Create a preset** - go to Presets tab, click "Create Preset"
5. **Apply a preset** - click "Apply Preset" on any preset card
6. **Lock an output** - click the padlock icon to prevent changes

### Demo Data Included:
- **Default routes** - some outputs pre-routed for demonstration
- **Professional labels** - cameras, monitors, recording, streaming
- **Sample presets** - Studio A/B setups and multi-camera configurations

## 🔧 Alternative Launch Methods

### Quick Demo (Single Command)
```bash
./start-demo.sh
```

### Development Mode
```bash
./start-dev.sh
```

### Production Build
```bash
./build.sh && ./start.sh
```

## 📱 Responsive Design
- **Desktop optimized** - full feature set
- **Tablet friendly** - touch-optimized controls
- **Professional styling** - broadcast industry standards

## 🎉 The Interface is Ready!

The web interface is fully functional with:
- ✅ Professional broadcast UI/UX
- ✅ Complete routing matrix control
- ✅ Advanced preset management
- ✅ Real-time WebSocket communication
- ✅ 120x120 matrix scaling
- ✅ Dark theme for control rooms
- ✅ Search and filter capabilities
- ✅ Lock/unlock safety features

### Ready for Production
Once you've explored the interface, you can:
1. Configure real VideoHub connection in `server/.env`
2. Deploy using the production build
3. Integrate with your broadcast infrastructure

**Open http://localhost:3000 and explore your new SDI router interface!** 🎬