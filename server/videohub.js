const net = require('net');
const EventEmitter = require('events');
const config = require('./config');

class VideoHub extends EventEmitter {
  constructor(host, port) {
    super();
    this.host = host;
    this.port = port;
    this.client = null;
    this.connected = false;
    this.routes = {};
    this.labels = { inputs: {}, outputs: {} };
    this.buffer = '';
    this.preludeReceived = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.autoReconnect = false; // Disable auto-reconnect by default
  }

  connect() {
    console.log(`Connecting to VideoHub at ${this.host}:${this.port}`);
    
    this.client = net.createConnection({ host: this.host, port: this.port }, () => {
      console.log('Connected to VideoHub');
      this.connected = true;
      this.preludeReceived = false;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      // VideoHub automatically sends PRELUDE on connection
      // We don't need to request it
    });

    this.client.on('data', (data) => {
      this.buffer += data.toString();
      this.parseBuffer();
    });

    this.client.on('error', (err) => {
      console.error('VideoHub connection error:', err);
      this.emit('error', err);
    });

    this.client.on('close', () => {
      console.log('VideoHub connection closed');
      this.connected = false;
      this.preludeReceived = false;
      this.emit('disconnected');
      
      // Attempt to reconnect with exponential backoff only if autoReconnect is enabled
      if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = Math.min(5000 * Math.pow(1.5, this.reconnectAttempts), 30000);
        this.reconnectAttempts++;
        console.log(`Reconnecting in ${delay/1000} seconds... (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
          if (!this.connected && this.autoReconnect) {
            this.connect();
          }
        }, delay);
      } else if (this.autoReconnect) {
        console.error('Max reconnection attempts reached');
        this.emit('max_reconnect_attempts');
      }
    });

    this.client.on('timeout', () => {
      console.error('VideoHub connection timeout');
      this.client.destroy();
    });

    // Set timeout for connection
    this.client.setTimeout(5000);
  }

  parseBuffer() {
    // Check for END PRELUDE
    if (!this.preludeReceived && this.buffer.includes('END PRELUDE:')) {
      this.preludeReceived = true;
      console.log('PRELUDE received from VideoHub');
      this.emit('prelude_received');
      
      // Parse the prelude data
      const preludeEnd = this.buffer.indexOf('END PRELUDE:') + 'END PRELUDE:'.length;
      const preludeData = this.buffer.substring(0, preludeEnd);
      this.parsePrelude(preludeData);
      
      // Remove prelude from buffer
      this.buffer = this.buffer.substring(preludeEnd);
    }

    // Check for ACK
    if (this.buffer.includes('ACK')) {
      const ackIndex = this.buffer.indexOf('ACK');
      console.log('ACK received for command');
      this.emit('ack');
      // Remove ACK from buffer
      this.buffer = this.buffer.substring(0, ackIndex) + this.buffer.substring(ackIndex + 3);
    }

    // Parse regular updates after prelude
    if (this.preludeReceived) {
      const lines = this.buffer.split('\n');
      let currentSection = null;
      let sectionData = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.endsWith(':')) {
          if (currentSection && sectionData.length > 0) {
            this.processSection(currentSection, sectionData);
          }
          currentSection = line.slice(0, -1);
          sectionData = [];
        } else if (line === '' && currentSection) {
          this.processSection(currentSection, sectionData);
          currentSection = null;
          sectionData = [];
        } else if (currentSection && line) {
          sectionData.push(line);
        }
      }

      // Keep any incomplete data in buffer
      const lastNewline = this.buffer.lastIndexOf('\n');
      this.buffer = lastNewline !== -1 ? this.buffer.slice(lastNewline + 1) : '';
    }
  }

  parsePrelude(preludeData) {
    const sections = preludeData.split('\n\n').filter(s => s.trim());
    
    sections.forEach(section => {
      const lines = section.split('\n');
      const sectionName = lines[0].replace(':', '').trim();
      const sectionData = lines.slice(1).filter(l => l.trim());
      
      if (sectionName && sectionData.length > 0) {
        this.processSection(sectionName, sectionData);
      }
    });
  }

  processSection(section, data) {
    switch (section) {
      case 'VIDEO OUTPUT ROUTING':
        data.forEach(line => {
          const [output, input] = line.split(' ').map(Number);
          if (!isNaN(output) && !isNaN(input)) {
            this.routes[output] = input;
            this.emit('route', output, input);
          }
        });
        break;

      case 'INPUT LABELS':
        data.forEach(line => {
          const match = line.match(/^(\d+)\s+(.+)$/);
          if (match) {
            const [, index, name] = match;
            this.labels.inputs[index] = { name };
            this.emit('labelChange', 'input', parseInt(index), name);
          }
        });
        this.emit('labels', this.labels);
        break;

      case 'OUTPUT LABELS':
        data.forEach(line => {
          const match = line.match(/^(\d+)\s+(.+)$/);
          if (match) {
            const [, index, name] = match;
            this.labels.outputs[index] = { name };
            this.emit('labelChange', 'output', parseInt(index), name);
          }
        });
        this.emit('labels', this.labels);
        break;
    }
  }

  send(command) {
    if (this.connected && this.client && this.preludeReceived) {
      console.log('Sending command:', command.replace(/\n/g, '\\n'));
      this.client.write(command);
    } else {
      console.warn('Cannot send command - not connected or prelude not received');
    }
  }

  setRoute(output, input) {
    if (this.connected && this.preludeReceived) {
      // Ensure output and input are numbers
      output = parseInt(output);
      input = parseInt(input);
      
      // Validate range using config values
      if (output < 0 || output >= config.videohub.maxOutputs || input < 0 || input >= config.videohub.maxInputs) {
        console.error(`Invalid route: output ${output} to input ${input} (max: ${config.videohub.maxOutputs-1}x${config.videohub.maxInputs-1})`);
        return false;
      }
      
      this.send(`VIDEO OUTPUT ROUTING:\n${output} ${input}\n\n`);
      // Don't update local state here - wait for confirmation from device
      return true;
    }
    return false;
  }

  setMultipleRoutes(routes) {
    if (this.connected && this.preludeReceived) {
      // Build batch routing command
      let command = 'VIDEO OUTPUT ROUTING:\n';
      
      for (const [output, input] of Object.entries(routes)) {
        const out = parseInt(output);
        const inp = parseInt(input);
        
        if (out >= 0 && out < config.videohub.maxOutputs && inp >= 0 && inp < config.videohub.maxInputs) {
          command += `${out} ${inp}\n`;
        }
      }
      
      command += '\n';
      this.send(command);
      return true;
    }
    return false;
  }

  getRoutes() {
    return this.routes;
  }

  getLabels() {
    return this.labels;
  }

  setInputLabel(index, label) {
    if (this.connected && this.preludeReceived) {
      index = parseInt(index);
      
      // Validate range and label
      if (index < 0 || index >= config.videohub.maxInputs) {
        console.error(`Invalid input index: ${index} (max: ${config.videohub.maxInputs-1})`);
        return false;
      }
      
      // Validate label length (VideoHub typically limits to 20 characters)
      if (!label || label.trim().length === 0 || label.trim().length > 20) {
        console.error(`Invalid label: must be 1-20 characters`);
        return false;
      }
      
      const trimmedLabel = label.trim();
      this.send(`INPUT LABELS:\n${index} ${trimmedLabel}\n\n`);
      return true;
    }
    return false;
  }

  setOutputLabel(index, label) {
    if (this.connected && this.preludeReceived) {
      index = parseInt(index);
      
      // Validate range and label
      if (index < 0 || index >= config.videohub.maxOutputs) {
        console.error(`Invalid output index: ${index} (max: ${config.videohub.maxOutputs-1})`);
        return false;
      }
      
      // Validate label length (VideoHub typically limits to 20 characters)
      if (!label || label.trim().length === 0 || label.trim().length > 20) {
        console.error(`Invalid label: must be 1-20 characters`);
        return false;
      }
      
      const trimmedLabel = label.trim();
      this.send(`OUTPUT LABELS:\n${index} ${trimmedLabel}\n\n`);
      return true;
    }
    return false;
  }

  disconnect() {
    this.autoReconnect = false; // Disable auto-reconnect when manually disconnecting
    if (this.client) {
      this.client.destroy();
      this.client = null;
      this.connected = false;
    }
  }

  updateConnectionSettings(host, port) {
    this.host = host;
    this.port = port;
  }

  connectWithAutoReconnect() {
    this.autoReconnect = true;
    this.reconnectAttempts = 0;
    this.connect();
  }
}

module.exports = VideoHub;