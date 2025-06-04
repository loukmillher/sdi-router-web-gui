import React from 'react';

const Header = ({ connected, activeTab, onTabChange }) => {
  const getConnectionStatusColor = () => {
    if (connected === true) return 'bg-green-500';
    if (connected === false) return 'bg-red-500';
    return 'bg-yellow-500'; // connecting/unknown
  };

  const getConnectionStatusText = () => {
    if (connected === true) return 'Connected';
    if (connected === false) return 'Disconnected';
    return 'Connecting';
  };

  const tabs = [
    { id: 'presets', label: 'PRESETS' },
    { id: 'routing', label: 'ROUTING' },
    { id: 'settings', label: 'SETTINGS' }
  ];

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Left: Application Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-slate-200">Videohub Control</h1>
        </div>

        {/* Right: Connection Status and Navigation */}
        <div className="flex items-center space-x-6">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
            <span className="text-sm text-slate-300">{getConnectionStatusText()}</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="ml-2 text-xs text-blue-200">(Active)</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;