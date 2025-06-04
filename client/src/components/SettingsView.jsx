import React, { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  XCircleIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import Header from './Header';
import Footer from './Footer';

const SettingsView = ({ 
  connected,
  onTabChange,
  activeTab = 'settings',
  connectionInfo = { host: '', port: '', connected: false },
  onConnectionChange
}) => {
  const [settings, setSettings] = useState({
    ipAddress: '192.168.1.100',
    port: '9990'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastConnectionAttempt, setLastConnectionAttempt] = useState(null);
  const [errors, setErrors] = useState({});

  // Initialize settings from connectionInfo
  useEffect(() => {
    if (connectionInfo.host && connectionInfo.port) {
      setSettings({
        ipAddress: connectionInfo.host,
        port: connectionInfo.port.toString()
      });
    }
  }, [connectionInfo]);

  // Update connection status based on connected prop
  useEffect(() => {
    if (connected) {
      setConnectionStatus('connected');
      setIsConnecting(false);
    } else if (isConnecting) {
      setConnectionStatus('connecting');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [connected, isConnecting]);

  const validateIP = (ip) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const validatePort = (port) => {
    const portNum = parseInt(port);
    return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!settings.ipAddress.trim()) {
      newErrors.ipAddress = 'IP Address is required';
    } else if (!validateIP(settings.ipAddress.trim())) {
      newErrors.ipAddress = 'Please enter a valid IP address (e.g., 192.168.1.100)';
    }

    if (!settings.port.trim()) {
      newErrors.port = 'Port is required';
    } else if (!validatePort(settings.port.trim())) {
      newErrors.port = 'Port must be between 1 and 65535';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;

    setIsConnecting(true);
    setConnectionStatus('connecting');
    setLastConnectionAttempt(new Date());

    try {
      // Call the connection change handler
      if (onConnectionChange) {
        await onConnectionChange({
          host: settings.ipAddress.trim(),
          port: parseInt(settings.port.trim())
        });
      }

      // Simulate connection attempt delay
      setTimeout(() => {
        if (!connected) {
          setIsConnecting(false);
          setConnectionStatus('failed');
        }
      }, 5000);

    } catch (error) {
      console.error('Connection error:', error);
      setIsConnecting(false);
      setConnectionStatus('failed');
    }
  };

  const handleDisconnect = () => {
    if (onConnectionChange) {
      onConnectionChange(null); // Signal disconnect
    }
    setConnectionStatus('disconnected');
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'connecting':
        return <WifiIcon className="w-6 h-6 text-yellow-500 animate-pulse" />;
      case 'failed':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      default:
        return <WifiIcon className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return `Connected to ${settings.ipAddress}:${settings.port}`;
      case 'connecting':
        return `Connecting to ${settings.ipAddress}:${settings.port}...`;
      case 'failed':
        return `Failed to connect to ${settings.ipAddress}:${settings.port}`;
      default:
        return 'Not connected';
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'connecting':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'failed':
        return 'text-red-400 bg-red-900/20 border-red-700';
      default:
        return 'text-slate-400 bg-slate-900/20 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <Header 
        connected={connected}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <Cog6ToothIcon className="w-8 h-8 text-blue-400" />
                <h2 className="text-3xl font-bold text-slate-200">Settings</h2>
              </div>
              <p className="text-sm text-slate-400">
                Configure your VideoHub connection settings and manage device connectivity.
              </p>
            </div>

            {/* Connection Status Card */}
            <div className={`mb-8 p-6 rounded-lg border ${getStatusColor()}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon()}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">Connection Status</h3>
                    <p className="text-sm">{getStatusText()}</p>
                  </div>
                </div>
                {lastConnectionAttempt && (
                  <div className="text-xs text-slate-400">
                    Last attempt: {lastConnectionAttempt.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* VideoHub Connection Settings */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
              <h3 className="text-xl font-semibold text-slate-200 mb-6">VideoHub Connection</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* IP Address Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={settings.ipAddress}
                    onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                    placeholder="192.168.1.100"
                    className={`w-full bg-slate-700 border rounded-md px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.ipAddress ? 'border-red-500' : 'border-slate-600'
                    }`}
                    disabled={isConnecting}
                  />
                  {errors.ipAddress && (
                    <div className="mt-1 flex items-center space-x-1 text-red-400 text-sm">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>{errors.ipAddress}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the IP address of your VideoHub device
                  </p>
                </div>

                {/* Port Field */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="65535"
                    value={settings.port}
                    onChange={(e) => handleInputChange('port', e.target.value)}
                    placeholder="9990"
                    className={`w-full bg-slate-700 border rounded-md px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.port ? 'border-red-500' : 'border-slate-600'
                    }`}
                    disabled={isConnecting}
                  />
                  {errors.port && (
                    <div className="mt-1 flex items-center space-x-1 text-red-400 text-sm">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      <span>{errors.port}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    Default VideoHub port is 9990
                  </p>
                </div>
              </div>

              {/* Connection Buttons */}
              <div className="flex items-center space-x-4">
                {connectionStatus !== 'connected' ? (
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className={`flex items-center space-x-2 py-2 px-6 rounded-md font-semibold transition-colors ${
                      isConnecting
                        ? 'bg-yellow-600 text-white cursor-wait'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <WifiIcon className="w-5 h-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center space-x-2 py-2 px-6 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold transition-colors focus:ring-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    <span>Disconnect</span>
                  </button>
                )}

                {connectionStatus === 'failed' && (
                  <button
                    onClick={handleConnect}
                    className="py-2 px-4 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md font-semibold transition-colors"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            </div>

            {/* Connection Tips */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Connection Tips</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Ensure your VideoHub is powered on and connected to the network</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Verify the IP address is correct - check your VideoHub's network settings</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Default port for VideoHub is 9990 - only change if you've configured a custom port</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Make sure this computer and the VideoHub are on the same network</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>Check firewall settings if connection attempts fail</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        connectionInfo={{
          host: settings.ipAddress,
          port: settings.port,
          connected: connectionStatus === 'connected'
        }}
        onSaveConfiguration={() => {
          console.log('Settings saved:', settings);
          alert('Settings saved successfully!');
        }}
        isSaving={false}
      />
    </div>
  );
};

export default SettingsView;