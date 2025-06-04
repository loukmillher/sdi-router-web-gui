/**
 * WebSocket configuration
 * Automatically determines the correct WebSocket URL based on the environment
 */

/**
 * Get the WebSocket URL based on current location and environment
 * @returns {string} The WebSocket URL (ws:// or wss://)
 */
export const getWebSocketUrl = () => {
  // In development, use environment variable if set
  if (process.env.REACT_APP_WS_URL) {
    return process.env.REACT_APP_WS_URL;
  }

  // Determine protocol based on current page protocol
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  
  // In production, use the same host as the web page
  if (process.env.NODE_ENV === 'production') {
    return `${protocol}//${window.location.host}`;
  }
  
  // In development, default to localhost:3001
  const host = window.location.hostname || 'localhost';
  const port = process.env.REACT_APP_SERVER_PORT || 3001;
  
  return `${protocol}//${host}:${port}`;
};

/**
 * Configuration for WebSocket connection
 */
export const wsConfig = {
  // Reconnection settings
  reconnectInterval: 3000,
  maxReconnectAttempts: 10,
  
  // Timeout settings
  connectionTimeout: 5000,
  
  // Get the current WebSocket URL
  get url() {
    return getWebSocketUrl();
  }
};