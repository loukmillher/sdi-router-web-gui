# Security Features

This document outlines the security improvements implemented in the SDI Router application.

## 🔒 HTTPS/WSS Support

The application now supports encrypted connections using HTTPS and WebSocket Secure (WSS).

### Development Setup

**Generate SSL Certificates:**
```bash
cd server
npm run generate-cert
```

**Start in Secure Mode:**
```bash
# Start demo with HTTPS/WSS
./start-demo.sh --secure

# Or start server manually with SSL
cd server
npm run start:secure
```

### Production Deployment

Set environment variable to enable SSL:
```bash
USE_SSL=true npm start
```

**Certificate Location:**
- Private Key: `server/certs/server.key`  
- Certificate: `server/certs/server.cert`

For production, replace self-signed certificates with proper SSL certificates from a Certificate Authority.

## 🛡️ Input Validation

### Label Validation

Input labels are now validated to prevent injection and ensure VideoHub compatibility:

**Allowed Characters:**
- Letters (a-z, A-Z)
- Numbers (0-9)  
- Spaces
- Hyphens (-)
- Underscores (_)
- Periods (.)

**Restrictions:**
- Maximum 20 characters
- No consecutive spaces
- No empty labels
- No special characters (automatically sanitized)

**Implementation:**
```javascript
import { validateLabel } from '../utils/validation';

const validation = validateLabel(userInput);
if (validation.isValid) {
  // Use validation.sanitized
} else {
  // Show validation.error
}
```

## 🔄 WebSocket Connection Logic

The client automatically determines the correct WebSocket protocol:

**Auto-Detection:**
- `https://` page → uses `wss://`
- `http://` page → uses `ws://`

**Environment Variables:**
```bash
# Override WebSocket URL
REACT_APP_WS_URL=wss://localhost:3001

# Custom server port  
REACT_APP_SERVER_PORT=3001
```

## 🚦 Security Best Practices

### Implemented

✅ **Encrypted Connections** - HTTPS/WSS support  
✅ **Input Sanitization** - Label validation and cleaning  
✅ **Self-Signed Certificates** - For development  
✅ **Auto Protocol Detection** - Secure by default  

### Recommended for Production

🔄 **Authentication** - User access control  
🔄 **Authorization** - Role-based permissions  
🔄 **Rate Limiting** - Prevent command flooding  
🔄 **Audit Logging** - Track all changes  
🔄 **IP Whitelisting** - Restrict network access  
🔄 **Valid SSL Certificates** - Replace self-signed certs  

## 🛠️ Configuration Files

### Server SSL Configuration
```javascript
// server/index.js
const useSSL = process.env.USE_SSL === 'true';
const certPath = path.join(__dirname, 'certs', 'server.cert');
const keyPath = path.join(__dirname, 'certs', 'server.key');
```

### Client WebSocket Configuration  
```javascript
// client/src/config/websocket.js
export const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}`;
};
```

## 📋 Usage Examples

### Standard Mode (HTTP/WS)
```bash
./start-demo.sh
# Opens: http://localhost:3000
# WebSocket: ws://localhost:3001
```

### Secure Mode (HTTPS/WSS)
```bash
./start-demo.sh --secure
# Opens: https://localhost:3000  
# WebSocket: wss://localhost:3001
```

### Production Environment
```bash
USE_SSL=true NODE_ENV=production npm start
```

**Note:** Browsers will show certificate warnings for self-signed certificates. This is normal for development - click "Advanced" and "Proceed to localhost" to continue.

## 🔍 Troubleshooting

### SSL Certificate Issues
```bash
# Regenerate certificates
cd server
rm -rf certs/
npm run generate-cert
```

### WebSocket Connection Issues
1. Check browser console for connection errors
2. Verify server is running with correct protocol
3. Check firewall settings for ports 3000/3001
4. For production, ensure certificates are valid

### Browser Security Warnings
- **Chrome:** Click "Advanced" → "Proceed to localhost"
- **Firefox:** Click "Advanced" → "Add Exception"  
- **Safari:** Click "Show Details" → "Visit Website"

This is expected behavior for self-signed certificates in development.