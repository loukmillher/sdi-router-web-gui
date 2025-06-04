#!/usr/bin/env node

/**
 * Script to generate self-signed SSL certificates for development
 * Run this to create certificates for HTTPS/WSS support
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, 'certs');
const keyFile = path.join(certDir, 'server.key');
const certFile = path.join(certDir, 'server.cert');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
  console.log('Created certs directory');
}

// Check if certificates already exist
if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
  console.log('SSL certificates already exist in ./certs/');
  console.log('Delete them first if you want to regenerate.');
  process.exit(0);
}

try {
  console.log('Generating self-signed SSL certificate for development...');
  
  // Generate private key and certificate in one command
  const command = `openssl req -x509 -newkey rsa:4096 -keyout "${keyFile}" -out "${certFile}" -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`;
  
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ SSL certificates generated successfully!');
  console.log(`   Private Key: ${keyFile}`);
  console.log(`   Certificate: ${certFile}`);
  console.log('\n⚠️  Note: These are self-signed certificates for development only.');
  console.log('   Browsers will show security warnings which you can bypass for localhost.');
  console.log('\n📝 To use: The server will automatically detect and use these certificates.');
  
} catch (error) {
  console.error('\n❌ Failed to generate certificates');
  console.error('Make sure OpenSSL is installed on your system:');
  console.error('  - macOS: Should be pre-installed');
  console.error('  - Ubuntu/Debian: sudo apt-get install openssl');
  console.error('  - Windows: Install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html');
  console.error('\nError:', error.message);
  process.exit(1);
}