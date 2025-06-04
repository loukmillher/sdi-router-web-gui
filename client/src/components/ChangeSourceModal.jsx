import React, { useState, useEffect } from 'react';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDisplayNumber, getDefaultLabel } from '../utils/numberUtils';

const ChangeSourceModal = ({ 
  isOpen, 
  onClose, 
  outputIndex, 
  outputLabel, 
  currentInput,
  inputs = [],
  labels = {},
  onApply 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInput, setSelectedInput] = useState(currentInput);

  useEffect(() => {
    if (isOpen) {
      setSelectedInput(currentInput);
      setSearchTerm('');
    }
  }, [isOpen, currentInput]);

  const getInputLabel = (index) => {
    return labels.inputs?.[index]?.name || getDefaultLabel('inputs', index);
  };

  const filteredInputs = inputs.filter(input => {
    if (!searchTerm) return true;
    const label = getInputLabel(input).toLowerCase();
    const displayNumber = formatDisplayNumber(input);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      label.includes(searchLower) ||
      displayNumber.includes(searchTerm) ||
      (input + 1).toString().includes(searchTerm)
    );
  });

  const handleApply = () => {
    if (selectedInput !== undefined) {
      onApply(outputIndex, selectedInput);
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 z-50 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
          <h2 className="text-lg font-semibold text-slate-200">
            Route Source to: <span className="text-blue-400">OUT {formatDisplayNumber(outputIndex)}: {outputLabel}</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Sources by Name or Index..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Current Selection Display */}
        {selectedInput !== undefined && (
          <div className="mb-4 p-3 bg-blue-900/30 border border-blue-700 rounded-md">
            <div className="text-sm text-blue-300">
              Selected: <span className="font-mono">IN {formatDisplayNumber(selectedInput)}: {getInputLabel(selectedInput)}</span>
            </div>
          </div>
        )}

        {/* Source List */}
        <div className="flex-1 overflow-y-auto mb-4 border border-slate-600 rounded-md">
          <div className="max-h-96">
            {filteredInputs.length > 0 ? (
              filteredInputs.map(input => (
                <button
                  key={input}
                  onClick={() => setSelectedInput(input)}
                  className={`w-full text-left p-3 border-b border-slate-600 last:border-b-0 transition-colors ${
                    selectedInput === input
                      ? 'bg-blue-600 text-white'
                      : currentInput === input
                        ? 'bg-green-900/50 text-green-300 hover:bg-green-800/50'
                        : 'text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-sm">
                        IN {formatDisplayNumber(input)}:
                      </span>
                      <span className="text-sm">
                        {getInputLabel(input)}
                      </span>
                    </div>
                    {currentInput === input && (
                      <span className="text-xs text-green-400">Current</span>
                    )}
                    {selectedInput === input && selectedInput !== currentInput && (
                      <span className="text-xs text-blue-300">Selected</span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-slate-400">
                No sources found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={selectedInput === undefined}
            className={`py-2 px-4 rounded-md font-semibold transition-colors ${
              selectedInput !== undefined
                ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeSourceModal;