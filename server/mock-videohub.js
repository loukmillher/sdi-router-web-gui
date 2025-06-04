const net = require('net');
const config = require('./config');

class MockVideoHub {
  constructor() {
    this.server = null;
    this.clients = [];
    this.routes = {};
    this.labels = {
      inputs: {},
      outputs: {}
    };
    
    // Initialize with some demo routes and labels
    this.initializeDemoData();
  }

  initializeDemoData() {
    // Some initial routes for demo
    this.routes = {
      0: 0,   // Output 0 -> Input 0
      1: 1,   // Output 1 -> Input 1
      2: 8,   // Output 2 -> Input 8
      3: 15,  // Output 3 -> Input 15
      10: 20, // Output 10 -> Input 20
      20: 50  // Output 20 -> Input 50
    };

    // Demo labels using the default labels from config
    this.labels = {
      inputs: { ...config.defaultLabels.inputs },
      outputs: { ...config.defaultLabels.outputs }
    };
  }

  start(port = 9990) {
    this.server = net.createServer((socket) => {
      console.log('Mock VideoHub: Client connected');
      this.clients.push(socket);

      // Send PRELUDE when client connects
      this.sendPrelude(socket);

      socket.on('data', (data) => {
        this.handleCommand(socket, data.toString());
      });

      socket.on('close', () => {
        console.log('Mock VideoHub: Client disconnected');
        this.clients = this.clients.filter(c => c !== socket);
      });

      socket.on('error', (err) => {
        console.error('Mock VideoHub: Socket error:', err);
      });
    });

    this.server.listen(port, () => {
      console.log(`Mock VideoHub server listening on port ${port}`);
    });
  }

  sendPrelude(socket) {
    let prelude = '';
    
    // Send current routing
    prelude += 'VIDEO OUTPUT ROUTING:\n';
    Object.entries(this.routes).forEach(([output, input]) => {
      prelude += `${output} ${input}\n`;
    });
    prelude += '\n';

    // Send input labels
    prelude += 'INPUT LABELS:\n';
    Object.entries(this.labels.inputs).forEach(([index, name]) => {
      prelude += `${index} ${name}\n`;
    });
    prelude += '\n';

    // Send output labels
    prelude += 'OUTPUT LABELS:\n';
    Object.entries(this.labels.outputs).forEach(([index, name]) => {
      prelude += `${index} ${name}\n`;
    });
    prelude += '\n';

    // End prelude
    prelude += 'END PRELUDE:\n\n';

    socket.write(prelude);
  }

  handleCommand(socket, data) {
    console.log('Mock VideoHub: Received command:', data.replace(/\n/g, '\\n'));

    if (data.includes('VIDEO OUTPUT ROUTING:')) {
      this.handleRoutingCommand(socket, data);
    } else if (data.includes('INPUT LABELS:')) {
      this.handleInputLabelCommand(socket, data);
    } else if (data.includes('OUTPUT LABELS:')) {
      this.handleOutputLabelCommand(socket, data);
    }
  }

  handleRoutingCommand(socket, data) {
    // Parse routing command
    const lines = data.split('\n').filter(line => line.trim());
    const routingLines = lines.slice(1); // Skip the header line

    let routesChanged = false;

    routingLines.forEach(line => {
      const match = line.match(/^(\d+)\s+(\d+)$/);
      if (match) {
        const output = parseInt(match[1]);
        const input = parseInt(match[2]);
        
        if (output >= 0 && output <= 119 && input >= 0 && input <= 119) {
          this.routes[output] = input;
          routesChanged = true;
          console.log(`Mock VideoHub: Route changed - Output ${output} -> Input ${input}`);
        }
      }
    });

    // Send ACK
    socket.write('ACK\n');

    // Broadcast routing changes to all clients with a small delay
    if (routesChanged) {
      setTimeout(() => {
        this.broadcastRoutingUpdate();
      }, 100);
    }
  }

  handleInputLabelCommand(socket, data) {
    // Parse input label command
    const lines = data.split('\n').filter(line => line.trim());
    const labelLines = lines.slice(1); // Skip the header line

    let labelsChanged = false;

    labelLines.forEach(line => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const index = parseInt(match[1]);
        const label = match[2].trim();
        
        if (index >= 0 && index <= 119 && label.length > 0 && label.length <= 20) {
          this.labels.inputs[index] = label;
          labelsChanged = true;
          console.log(`Mock VideoHub: Input label changed - Input ${index}: "${label}"`);
        }
      }
    });

    // Send ACK
    socket.write('ACK\n');

    // Broadcast label changes to all clients with a small delay
    if (labelsChanged) {
      setTimeout(() => {
        this.broadcastInputLabelUpdate();
      }, 100);
    }
  }

  handleOutputLabelCommand(socket, data) {
    // Parse output label command
    const lines = data.split('\n').filter(line => line.trim());
    const labelLines = lines.slice(1); // Skip the header line

    let labelsChanged = false;

    labelLines.forEach(line => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const index = parseInt(match[1]);
        const label = match[2].trim();
        
        if (index >= 0 && index <= 119 && label.length > 0 && label.length <= 20) {
          this.labels.outputs[index] = label;
          labelsChanged = true;
          console.log(`Mock VideoHub: Output label changed - Output ${index}: "${label}"`);
        }
      }
    });

    // Send ACK
    socket.write('ACK\n');

    // Broadcast label changes to all clients with a small delay
    if (labelsChanged) {
      setTimeout(() => {
        this.broadcastOutputLabelUpdate();
      }, 100);
    }
  }

  broadcastRoutingUpdate() {
    const routingUpdate = 'VIDEO OUTPUT ROUTING:\n' + 
      Object.entries(this.routes).map(([output, input]) => `${output} ${input}`).join('\n') + 
      '\n\n';

    this.clients.forEach(client => {
      try {
        client.write(routingUpdate);
      } catch (err) {
        console.error('Mock VideoHub: Error broadcasting update:', err);
      }
    });
  }

  broadcastInputLabelUpdate() {
    const labelUpdate = 'INPUT LABELS:\n' + 
      Object.entries(this.labels.inputs).map(([index, label]) => `${index} ${label}`).join('\n') + 
      '\n\n';

    this.clients.forEach(client => {
      try {
        client.write(labelUpdate);
      } catch (err) {
        console.error('Mock VideoHub: Error broadcasting input label update:', err);
      }
    });
  }

  broadcastOutputLabelUpdate() {
    const labelUpdate = 'OUTPUT LABELS:\n' + 
      Object.entries(this.labels.outputs).map(([index, label]) => `${index} ${label}`).join('\n') + 
      '\n\n';

    this.clients.forEach(client => {
      try {
        client.write(labelUpdate);
      } catch (err) {
        console.error('Mock VideoHub: Error broadcasting output label update:', err);
      }
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.clients.forEach(client => client.destroy());
      this.clients = [];
      console.log('Mock VideoHub server stopped');
    }
  }
}

module.exports = MockVideoHub;