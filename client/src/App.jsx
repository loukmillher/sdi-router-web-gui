import React, { useState, useEffect } from 'react';
import RoutingView from './components/RoutingView';
import PresetView from './components/PresetView';
import useWebSocket from './hooks/useWebSocket';

function App() {
  const [routes, setRoutes] = useState({});
  const [labels, setLabels] = useState({ inputs: {}, outputs: {} });
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('routing');
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const connectionInfo = {
    host: 'localhost', // TODO: Get from config
    port: '9990',
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

  return (
    <RoutingView
      connected={connected && isConnected}
      routes={routes}
      labels={labels}
      onRoute={handleRoute}
      onTabChange={handleTabChange}
      activeTab={activeTab}
      connectionInfo={connectionInfo}
    />
  );
}

export default App;