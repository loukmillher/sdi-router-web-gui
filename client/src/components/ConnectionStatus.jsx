import React from 'react';

const ConnectionStatus = ({ isConnected }) => {
  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
      <span className="text-sm">
        {isConnected ? 'Connected' : 'Unconnected'}
      </span>
    </div>
  );
};

export default ConnectionStatus;