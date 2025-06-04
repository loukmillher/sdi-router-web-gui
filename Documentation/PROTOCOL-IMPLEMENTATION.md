# Blackmagic Router Control Protocol Implementation

## Overview

This implementation provides a WebSocket-to-TCP bridge for controlling Blackmagic Smart VideoHub devices using their native Router Control Protocol.

## Protocol Compliance

### Connection Flow
1. **TCP Connection**: Connect to VideoHub on port 9990
2. **PRELUDE Reception**: VideoHub automatically sends current state
3. **END PRELUDE Marker**: Wait for "END PRELUDE:" before sending commands
4. **Command/Response**: Send commands and wait for ACK acknowledgments

### Implemented Features

#### ✅ Core Protocol Features
- **TCP Connection Management**: Persistent connection with auto-reconnection
- **PRELUDE Handling**: Proper parsing of initial state information
- **ACK Response Handling**: Command acknowledgment processing
- **Command Format Compliance**: Exact protocol format matching

#### ✅ Routing Commands
- **Single Route**: `VIDEO OUTPUT ROUTING:\n<output> <input>\n\n`
- **Batch Routing**: Multiple routes in single command block
- **Input Validation**: Range checking for 120x120 matrix (0-119)
- **Real-time Updates**: Live routing change notifications

#### ✅ Label Support
- **Input Labels**: Parse and store input channel names
- **Output Labels**: Parse and store output channel names
- **Dynamic Updates**: Handle label changes from device

#### ✅ Error Handling
- **Connection Timeout**: 5-second timeout for operations
- **Exponential Backoff**: Smart reconnection with increasing delays
- **Max Retry Limit**: Prevents infinite reconnection attempts
- **Protocol Validation**: Ensures commands are only sent after PRELUDE

## WebSocket Bridge Architecture

### Message Types

#### Client → Server
```json
{
  "type": "route",
  "output": 0,
  "input": 1
}

{
  "type": "preset",
  "id": 1
}
```

#### Server → Client
```json
{
  "type": "connection",
  "connected": true
}

{
  "type": "route",
  "output": 0,
  "input": 1
}

{
  "type": "routes",
  "routes": { "0": 1, "1": 2 }
}

{
  "type": "labels",
  "labels": {
    "inputs": { "0": {"name": "Camera 1"} },
    "outputs": { "0": {"name": "Monitor 1"} }
  }
}
```

## Configuration

### Environment Variables
```bash
VIDEOHUB_HOST=192.168.1.100
VIDEOHUB_PORT=9990
```

### Preset Configuration
Presets are defined in `config.js` and support batch routing:
```javascript
presets: {
  1: {
    name: 'Preset 1',
    routes: {
      0: 0,  // Output 0 → Input 0
      1: 1,  // Output 1 → Input 1
      2: 2   // Output 2 → Input 2
    }
  }
}
```

## Testing

Run the protocol test:
```bash
cd server
node test-protocol.js
```

Expected output:
```
✓ Connected to VideoHub
✓ PRELUDE received - protocol handshake complete
✓ Single route command sent
✓ ACK received from VideoHub
✓ Route confirmed: Output 0 -> Input 1
```

## Protocol Specifications Implemented

### Message Format
- **ASCII Text Protocol**: Human-readable commands
- **Line Endings**: Commands end with `\n\n`
- **Section Headers**: End with colon `:`
- **Data Format**: Space-separated values

### Command Structure
```
VIDEO OUTPUT ROUTING:
<output> <input>
<output> <input>
...

```

### Response Handling
- **ACK**: Command acknowledgment
- **Real-time Updates**: Routing changes from other sources
- **Error Recovery**: Automatic reconnection on disconnect

## Matrix Scale and UI Design

### 120x120 Matrix Support
The application is designed to handle large-scale routing matrices:

- **Server Validation**: Supports 0-119 inputs and outputs
- **Scalable UI**: Two-step selection process for managing 14,400 possible routes
- **Search Functionality**: Filter inputs/outputs by name or number
- **Overview Mode**: View all active routes in a compact list
- **Preset Management**: Supports complex multi-route configurations

### UI Modes
1. **Select Mode**: Choose output first, then select input from filtered grid
2. **Overview Mode**: See all current routes in a scrollable list
3. **Search**: Filter channels by name or number for quick access

## Known Limitations

1. **No Audio Routing**: Video routing only (as per original examples)
2. **No Device Discovery**: Requires manual IP configuration  
3. **No Authentication**: Protocol doesn't support authentication
4. **UI Performance**: Large matrices require efficient filtering and virtualization

## Extending the Implementation

### Adding Audio Routing
To add audio routing support, extend the `processSection` method:
```javascript
case 'AUDIO OUTPUT ROUTING':
  // Handle audio routing similar to video
```

### Supporting Different Matrix Sizes
Modify the configuration in `config.js`:
```javascript
videohub: {
  maxInputs: 240,   // For larger matrices
  maxOutputs: 240
}
```

## Troubleshooting

### Common Issues
1. **Connection Refused**: Check VideoHub IP and network connectivity
2. **Commands Ignored**: Ensure PRELUDE is received before sending commands
3. **Timeout Errors**: Verify VideoHub is responding on port 9990

### Debug Mode
Enable verbose logging by modifying the console.log statements in `videohub.js`.