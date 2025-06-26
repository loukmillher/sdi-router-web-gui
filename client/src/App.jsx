import React, { useState, useEffect } from 'react';
import RoutingView from './components/RoutingView';
import PresetView from './components/PresetView';
import SettingsView from './components/SettingsView';
import useWebSocket from './hooks/useWebSocket';
import { wsConfig } from './config/websocket';

function App() {
  const [routes, setRoutes] = useState({});
  const [labels, setLabels] = useState({ inputs: {}, outputs: {} });
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('routing');
  const [connectionSettings, setConnectionSettings] = useState({
    host: 'localhost',
    port: 3001
  });
  const { ws, isConnected, sendMessage } = useWebSocket(wsConfig.url);

  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'connection':
          setConnected(data.connected);
          break;
        case 'routes':
          setRoutes(data.routes);
          break;
        case 'labels':
          setLabels(data.labels);
          break;
        case 'route':
          setRoutes(prev => ({ ...prev, [data.output]: data.input }));
          break;
        case 'labelChange':
          if (data.type === 'input') {
            setLabels(prev => ({
              ...prev,
              inputs: {
                ...prev.inputs,
                [data.index]: { name: data.label }
              }
            }));
          } else if (data.type === 'output') {
            setLabels(prev => ({
              ...prev,
              outputs: {
                ...prev.outputs,
                [data.index]: { name: data.label }
              }
            }));
          }
          break;
        default:
          break;
      }
    };
  }, [ws]);

  const handleRoute = (output, input) => {
    sendMessage({
      type: 'route',
      output,
      input
    });
  };

  const handlePreset = (presetId) => {
    sendMessage({
      type: 'preset',
      id: presetId
    });
  };

  const handleLabelChange = (labelType, index, newLabel) => {
    sendMessage({
      type: 'labelChange',
      labelType,
      index,
      label: newLabel
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleConnectionChange = async (newSettings) => {
    if (newSettings) {
      try {
        // Update connection settings
        setConnectionSettings(newSettings);
        console.log('Connection settings updated:', newSettings);
        
        // Call the connect API endpoint
        const response = await fetch('/api/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            host: newSettings.host,
            port: newSettings.port
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to connect to VideoHub');
        }
        
        const data = await response.json();
        console.log('Connection initiated:', data);
      } catch (error) {
        console.error('Connection error:', error);
        throw error;
      }
    } else {
      // Handle disconnect
      console.log('Disconnecting from VideoHub');
      try {
        const response = await fetch('/api/disconnect', {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error('Failed to disconnect from VideoHub');
        }
        
        const data = await response.json();
        console.log('Disconnected:', data);
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  };

  const connectionInfo = {
    host: connectionSettings.host,
    port: connectionSettings.port.toString(),
    connected: connected && isConnected
  };

  if (activeTab === 'presets') {
    return (
      <PresetView
        connected={connected && isConnected}
        routes={routes}
        labels={labels}
        onRoute={handleRoute}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        connectionInfo={connectionInfo}
        onPresetSelect={handlePreset}
      />
    );
  }

  if (activeTab === 'settings') {
    return (
      <SettingsView
        connected={connected && isConnected}
        onTabChange={handleTabChange}
        activeTab={activeTab}
        connectionInfo={connectionInfo}
        onConnectionChange={handleConnectionChange}
      />
    );
  }

  return (
    <RoutingView
      connected={connected && isConnected}
      routes={routes}
      labels={labels}
      onRoute={handleRoute}
      onLabelChange={handleLabelChange}
      onTabChange={handleTabChange}
      activeTab={activeTab}
      connectionInfo={connectionInfo}
    />
  );
}

export default App;