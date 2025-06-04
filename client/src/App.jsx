import React, { useState, useEffect } from 'react';
import RoutingView from './components/RoutingView';
import PresetView from './components/PresetView';
import SettingsView from './components/SettingsView';
import useWebSocket from './hooks/useWebSocket';

function App() {
  const [routes, setRoutes] = useState({});
  const [labels, setLabels] = useState({ inputs: {}, outputs: {} });
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('routing');
  const [connectionSettings, setConnectionSettings] = useState({
    host: 'localhost',
    port: 3001
  });
  const { ws, isConnected, sendMessage } = useWebSocket('ws://localhost:3001');

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
      // Update connection settings
      setConnectionSettings(newSettings);
      console.log('Connection settings updated:', newSettings);
      
      // In a real implementation, this would trigger a reconnection
      // For now, we'll just update the settings
    } else {
      // Handle disconnect
      console.log('Disconnecting from VideoHub');
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