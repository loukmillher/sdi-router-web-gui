# Blackmagic SDI Router - Simplified Project Structure

```
sdi-router/
├── client/                    # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConnectionStatus.jsx
│   │   │   ├── MatrixGrid.jsx
│   │   │   ├── PresetButtons.jsx
│   │   │   └── Header.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── .gitignore
│
├── server/                    # Node.js backend
│   ├── index.js              # Main server file
│   ├── videohub.js           # TCP to WebSocket bridge
│   ├── config.js             # Configuration
│   ├── package.json
│   └── .env.example
│
├── build.sh                   # Build script
├── start.sh                   # Start script
├── README.md
└── .gitignore
```

## Key Features

- Single page React app with routing matrix
- WebSocket connection to Node.js server
- Node.js server bridges TCP to WebSocket
- Simple preset system
- Tailwind CSS for styling
- Static build deployment ready

## Removed Complexity

- No authentication system
- No database
- No Docker
- No complex state management
- No separate API routes
- Minimal folder nesting
- Single developer friendly