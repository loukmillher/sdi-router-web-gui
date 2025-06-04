const VideoHub = require('./videohub');
const config = require('./config');

// Test script to verify Blackmagic Router Control Protocol implementation
console.log('Testing Blackmagic Router Control Protocol Implementation');
console.log('=====================================================');

const videohub = new VideoHub(config.videohub.host, config.videohub.port);

// Event listeners for testing
videohub.on('connected', () => {
  console.log('✓ Connected to VideoHub');
});

videohub.on('prelude_received', () => {
  console.log('✓ PRELUDE received - protocol handshake complete');
  
  // Test single route
  setTimeout(() => {
    console.log('\nTesting single route command...');
    const success = videohub.setRoute(0, 1);
    console.log(success ? '✓ Single route command sent' : '✗ Failed to send route command');
  }, 1000);
  
  // Test batch routing
  setTimeout(() => {
    console.log('\nTesting batch route command...');
    const routes = { 0: 2, 1: 3, 2: 4, 10: 20, 20: 50 };
    const success = videohub.setMultipleRoutes(routes);
    console.log(success ? '✓ Batch route command sent' : '✗ Failed to send batch route command');
  }, 3000);

  // Test large matrix routes
  setTimeout(() => {
    console.log('\nTesting high-numbered routes (120x120 matrix)...');
    const success1 = videohub.setRoute(119, 119); // Last output to last input
    const success2 = videohub.setRoute(100, 50);  // Mid-range routing
    console.log(success1 && success2 ? '✓ High-numbered routes sent' : '✗ Failed to send high-numbered routes');
  }, 5000);
});

videohub.on('ack', () => {
  console.log('✓ ACK received from VideoHub');
});

videohub.on('route', (output, input) => {
  console.log(`✓ Route confirmed: Output ${output} -> Input ${input}`);
});

videohub.on('labels', (labels) => {
  console.log('✓ Labels received:', Object.keys(labels.inputs).length, 'inputs,', Object.keys(labels.outputs).length, 'outputs');
});

videohub.on('error', (err) => {
  console.error('✗ Connection error:', err.message);
});

videohub.on('disconnected', () => {
  console.log('! Disconnected from VideoHub');
});

videohub.on('max_reconnect_attempts', () => {
  console.error('✗ Max reconnection attempts reached');
  process.exit(1);
});

// Start connection
console.log(`Attempting to connect to ${config.videohub.host}:${config.videohub.port}...`);
videohub.connect();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  videohub.disconnect();
  process.exit(0);
});