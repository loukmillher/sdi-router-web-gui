import React from 'react';
import { CloudArrowDownIcon } from '@heroicons/react/24/outline';

const Footer = ({ 
  connectionInfo = { host: '', port: '', connected: false },
  onSaveConfiguration,
  isSaving = false 
}) => {
  const getConnectionText = () => {
    if (!connectionInfo.connected) {
      return 'Not Connected';
    }
    return `Connected to: ${connectionInfo.host}:${connectionInfo.port}`;
  };

  return (
    <footer className="bg-slate-800 border-t border-slate-700 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Left: Router Connection Info */}
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionInfo.connected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-slate-300">
            {getConnectionText()}
          </span>
        </div>

        {/* Right: Save Configuration Button */}
        <div>
          <button
            onClick={onSaveConfiguration}
            disabled={isSaving || !connectionInfo.connected}
            className={`flex items-center space-x-2 py-2 px-4 rounded-md font-semibold transition-colors ${
              isSaving || !connectionInfo.connected
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500'
            }`}
          >
            <CloudArrowDownIcon className="w-4 h-4" />
            <span>
              {isSaving ? 'Saving...' : 'Save Current Configuration'}
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;