const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const VideoHub = require('./videohub');
const MockVideoHub = require('./mock-videohub');
const config = require('./config');
const sequelize = require('./database');
const MigrationRunner = require('./database/migrate');
const presetRoutes = require('./routes/presets');

const app = express();

// Check for SSL certificates
const useSSL = process.env.USE_SSL === 'true' || process.env.NODE_ENV === 'production';
let server;
let serverProtocol;

if (useSSL) {
  const certPath = path.join(__dirname, 'certs', 'server.cert');
  const keyPath = path.join(__dirname, 'certs', 'server.key');
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const httpsOptions = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
    server = https.createServer(httpsOptions, app);
    serverProtocol = 'https';
    console.log('🔒 HTTPS/WSS enabled - using SSL certificates');
  } else {
    console.log('⚠️  SSL certificates not found. Run "npm run generate-cert" to create them.');
    console.log('   Falling back to HTTP/WS...');
    server = http.createServer(app);
    serverProtocol = 'http';
  }
} else {
  server = http.createServer(app);
  serverProtocol = 'http';
  console.log('🔓 Running in HTTP/WS mode (insecure)');
}

const wss = new WebSocket.Server({ server });

// Initialize VideoHub instance
const videohub = new VideoHub(config.videohub.host, config.videohub.port);

// Make videoHub available to routes
app.set('videoHub', videohub);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/presets', presetRoutes);

// API Endpoints for VideoHub connection management
app.post('/api/connect', (req, res) => {
  const { host, port } = req.body;
  
  if (!host || !port) {
    return res.status(400).json({ error: 'Host and port are required' });
  }
  
  // Disconnect if already connected
  if (videohub.connected) {
    videohub.disconnect();
  }
  
  // Update connection settings
  videohub.updateConnectionSettings(host, port);
  
  // Connect with auto-reconnect enabled
  videohub.connectWithAutoReconnect();
  
  res.json({ message: 'Connection initiated', host, port });
});

app.post('/api/disconnect', (req, res) => {
  videohub.disconnect();
  res.json({ message: 'Disconnected from VideoHub' });
});

app.get('/api/connection-status', (req, res) => {
  res.json({
    connected: videohub.connected,
    host: videohub.host,
    port: videohub.port,
    autoReconnect: videohub.autoReconnect
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Initialize mock server for demo mode
let mockServer = null;
if (process.env.DEMO_MODE === 'true') {
  console.log('🎭 Starting in DEMO mode - using mock VideoHub');
  mockServer = new MockVideoHub();
  mockServer.start(9990);
  
  // Wait a moment for mock server to start, then connect
  setTimeout(() => {
    console.log('Connecting to mock VideoHub...');
    videohub.connectWithAutoReconnect();
  }, 1000);
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'connection',
    connected: videohub.connected
  }));

  ws.send(JSON.stringify({
    type: 'routes',
    routes: videohub.getRoutes()
  }));

  ws.send(JSON.stringify({
    type: 'labels',
    labels: videohub.getLabels()
  }));

  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'route':
          videohub.setRoute(data.output, data.input);
          // Broadcast route change to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'route',
                output: data.output,
                input: data.input
              }));
            }
          });
          break;
          
        case 'preset':
          const preset = config.presets[data.id];
          if (preset) {
            // Use batch routing for better performance
            videohub.setMultipleRoutes(preset.routes);
            // Routes will be broadcast when confirmed by device
          }
          break;
          
        case 'labelChange':
          if (data.labelType === 'input') {
            videohub.setInputLabel(data.index, data.label);
          } else if (data.labelType === 'output') {
            videohub.setOutputLabel(data.index, data.label);
          }
          // Label changes will be broadcast when confirmed by device
          break;
          
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// VideoHub event handlers
videohub.on('connected', () => {
  console.log('VideoHub connected - broadcasting to clients');
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'connection',
        connected: true
      }));
    }
  });
});

videohub.on('disconnected', () => {
  console.log('VideoHub disconnected - broadcasting to clients');
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'connection',
        connected: false
      }));
    }
  });
});

videohub.on('route', (output, input) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'route',
        output,
        input
      }));
    }
  });
});

videohub.on('labels', (labels) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'labels',
        labels
      }));
    }
  });
});

videohub.on('labelChange', (labelType, index, label) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'labelChange',
        labelType,
        index,
        label
      }));
    }
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Run database migrations
    console.log('Running database migrations...');
    const migrationRunner = new MigrationRunner();
    await migrationRunner.run();

    // Sync database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Start server
    const PORT = process.env.PORT || 3001;
    server.listen(PORT, () => {
      console.log(`Server running on ${serverProtocol}://localhost:${PORT}`);
      console.log(`WebSocket available at ${serverProtocol === 'https' ? 'wss' : 'ws'}://localhost:${PORT}`);
      console.log('VideoHub connection not established. Use the setup page to connect.');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();