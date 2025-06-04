import React, { useState } from 'react';
import { formatDisplayNumber, getDefaultLabel } from '../utils/numberUtils';

const MatrixGrid = ({ routes, labels, onRoute }) => {
  const [selectedOutput, setSelectedOutput] = useState(0);
  const [viewMode, setViewMode] = useState('select'); // 'select' or 'overview'
  const [searchInput, setSearchInput] = useState('');
  const [searchOutput, setSearchOutput] = useState('');
  
  const MAX_INPUTS = 120;
  const MAX_OUTPUTS = 120;

  const getLabel = (type, index) => {
    const labelObj = labels[type]?.[index];
    return labelObj?.name || getDefaultLabel(type, index);
  };

  const filteredInputs = Array.from({ length: MAX_INPUTS }, (_, i) => i)
    .filter(i => {
      if (!searchInput) return true;
      const label = getLabel('inputs', i).toLowerCase();
      return label.includes(searchInput.toLowerCase()) || i.toString().includes(searchInput);
    });

  const filteredOutputs = Array.from({ length: MAX_OUTPUTS }, (_, i) => i)
    .filter(i => {
      if (!searchOutput) return true;
      const label = getLabel('outputs', i).toLowerCase();
      return label.includes(searchOutput.toLowerCase()) || i.toString().includes(searchOutput);
    });

  if (viewMode === 'overview') {
    return (
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Routing Overview (120x120)</h2>
          <button 
            onClick={() => setViewMode('select')}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Switch to Select Mode
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
          {Object.entries(routes).map(([output, input]) => (
            <div key={`route-${output}`} className="bg-gray-700 p-3 rounded flex justify-between items-center">
              <span className="text-sm">
                Out {formatDisplayNumber(parseInt(output))}: {getLabel('outputs', parseInt(output))}
              </span>
              <span className="text-green-400 text-sm">
                → In {formatDisplayNumber(parseInt(input))}: {getLabel('inputs', parseInt(input))}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Routing Matrix (120x120)</h2>
        <button 
          onClick={() => setViewMode('overview')}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          View All Routes
        </button>
      </div>
      
      {/* Output Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <label className="text-sm font-semibold">Select Output:</label>
          <input
            type="text"
            placeholder="Search outputs..."
            value={searchOutput}
            onChange={(e) => setSearchOutput(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm w-48"
          />
        </div>
        <div className="max-h-32 overflow-y-auto bg-gray-700 rounded border border-gray-600">
          {filteredOutputs.slice(0, 50).map(output => (
            <div
              key={`output-${output}`}
              className={`p-2 cursor-pointer hover:bg-gray-600 flex justify-between items-center ${
                selectedOutput === output ? 'bg-blue-600' : ''
              }`}
              onClick={() => setSelectedOutput(output)}
            >
              <span className="text-sm">Output {formatDisplayNumber(output)}</span>
              <span className="text-xs text-gray-300">{getLabel('outputs', output)}</span>
              {routes[output] !== undefined && (
                <span className="text-xs text-green-400">→ In {formatDisplayNumber(routes[output])}</span>
              )}
            </div>
          ))}
          {filteredOutputs.length > 50 && (
            <div className="p-2 text-center text-xs text-gray-400">
              Showing first 50 results. Refine search to see more.
            </div>
          )}
        </div>
      </div>

      {/* Input Selection for Selected Output */}
      <div>
        <div className="flex items-center gap-4 mb-2">
          <label className="text-sm font-semibold">
            Route Output {formatDisplayNumber(selectedOutput)} ({getLabel('outputs', selectedOutput)}) to Input:
          </label>
          <input
            type="text"
            placeholder="Search inputs..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-sm w-48"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
          {filteredInputs.slice(0, 100).map(input => (
            <button
              key={`input-${input}`}
              className={`p-3 rounded text-left hover:bg-gray-600 transition-colors ${
                routes[selectedOutput] === input 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-700'
              }`}
              onClick={() => onRoute(selectedOutput, input)}
            >
              <div className="text-sm font-semibold">Input {formatDisplayNumber(input)}</div>
              <div className="text-xs text-gray-300">{getLabel('inputs', input)}</div>
              {routes[selectedOutput] === input && (
                <div className="text-xs text-green-200 mt-1">● Active</div>
              )}
            </button>
          ))}
          {filteredInputs.length > 100 && (
            <div className="p-3 text-center text-xs text-gray-400 col-span-full">
              Showing first 100 results. Refine search to see more.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatrixGrid;