require('dotenv').config();

module.exports = {
  videohub: {
    host: process.env.VIDEOHUB_HOST || '192.168.1.100',
    port: process.env.VIDEOHUB_PORT || 9990,
    maxInputs: 120,
    maxOutputs: 120
  },

  // Default labels for testing when VideoHub doesn't provide them
  defaultLabels: {
    inputs: {
      // Cameras
      0: 'Camera 1', 1: 'Camera 2', 2: 'Camera 3', 3: 'Camera 4',
      4: 'Camera 5', 5: 'Camera 6', 6: 'Camera 7', 7: 'Camera 8',
      8: 'Camera 9', 9: 'Camera 10', 10: 'Camera 11', 11: 'Camera 12',
      12: 'Camera 13', 13: 'Camera 14', 14: 'Camera 15', 15: 'Camera 16',
      
      // Playback sources
      20: 'Playback 1', 21: 'Playback 2', 22: 'Playback 3', 23: 'Playback 4',
      24: 'Graphics 1', 25: 'Graphics 2', 26: 'Graphics 3', 27: 'Graphics 4',
      
      // External sources
      30: 'External 1', 31: 'External 2', 32: 'External 3', 33: 'External 4',
      40: 'Computer 1', 41: 'Computer 2', 42: 'Computer 3', 43: 'Computer 4',
      
      // Special sources
      50: 'Satellite Feed', 51: 'Network Feed', 52: 'Backup Feed',
      119: 'Test Pattern'
    },
    outputs: {
      // Monitors
      0: 'Main Monitor', 1: 'Director Monitor', 2: 'Preview Monitor', 3: 'Program Monitor',
      4: 'Studio Monitor 1', 5: 'Studio Monitor 2', 6: 'Studio Monitor 3', 7: 'Studio Monitor 4',
      
      // Recording
      10: 'Recording 1', 11: 'Recording 2', 12: 'Recording 3', 13: 'Recording 4',
      14: 'Archive 1', 15: 'Archive 2', 16: 'Backup Rec 1', 17: 'Backup Rec 2',
      
      // Streaming
      20: 'Stream 1', 21: 'Stream 2', 22: 'Stream 3', 23: 'Stream 4',
      24: 'Webcast', 25: 'Social Media', 26: 'Backup Stream', 27: 'Emergency Stream',
      
      // Distribution
      30: 'Distribution 1', 31: 'Distribution 2', 32: 'Distribution 3', 33: 'Distribution 4',
      40: 'Remote Site 1', 41: 'Remote Site 2', 42: 'Remote Site 3', 43: 'Remote Site 4'
    }
  },
  
  presets: {
    1: {
      name: 'Studio A Setup',
      routes: {
        0: 0,   // Monitor 1 -> Camera 1
        1: 1,   // Monitor 2 -> Camera 2
        2: 2,   // Monitor 3 -> Camera 3
        3: 3,   // Monitor 4 -> Camera 4
        10: 10, // Recording 1 -> Input 11
        11: 11, // Recording 2 -> Input 12
        20: 20, // Streaming 1 -> Input 21
        21: 21  // Streaming 2 -> Input 22
      }
    },
    2: {
      name: 'Studio B Setup',
      routes: {
        0: 4,   // Monitor 1 -> Camera 5
        1: 5,   // Monitor 2 -> Camera 6
        2: 6,   // Monitor 3 -> Camera 7
        3: 7,   // Monitor 4 -> Camera 8
        10: 14, // Recording 1 -> Input 15
        11: 15, // Recording 2 -> Input 16
        20: 24, // Streaming 1 -> Input 25
        21: 25  // Streaming 2 -> Input 26
      }
    },
    3: {
      name: 'Multi-Camera Event',
      routes: {
        0: 0,   // Main Monitor -> Camera 1
        1: 1,   // Director Monitor -> Camera 2
        2: 8,   // Wide Shot -> Camera 9
        3: 9,   // Close Up -> Camera 10
        4: 16,  // Overhead -> Camera 17
        5: 17,  // Audience -> Camera 18
        10: 0,  // Recording Main -> Camera 1
        11: 8,  // Recording Wide -> Camera 9
        20: 0,  // Stream Main -> Camera 1
        30: 50, // Backup Output -> Input 51
        31: 51  // Emergency Feed -> Input 52
      }
    },
    4: {
      name: 'All Outputs to Test Pattern',
      routes: Object.fromEntries(
        Array.from({ length: 20 }, (_, i) => [i, 119]) // First 20 outputs to input 119 (test pattern)
      )
    }
  }
};