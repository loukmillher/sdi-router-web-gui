import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  TrashIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';
import { formatDisplayNumber, getDefaultLabel, parseDisplayNumber, validateDisplayInputRange, validateDisplayOutputRange } from '../utils/numberUtils';

const CreatePresetModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  currentRoutes = {},
  labels = { inputs: {}, outputs: {} },
  editingPreset = null // null for new preset, preset object for editing
}) => {
  const [presetName, setPresetName] = useState('');
  const [selectedRoutes, setSelectedRoutes] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showRouteBuilder, setShowRouteBuilder] = useState(false);
  const [newRoute, setNewRoute] = useState({ output: '', input: '' });
  const [routeBuilderSearch, setRouteBuilderSearch] = useState({ output: '', input: '' });
  const [showOutputDropdown, setShowOutputDropdown] = useState(false);
  const [showInputDropdown, setShowInputDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingPreset) {
        // Editing existing preset
        setPresetName(editingPreset.name);
        setSelectedRoutes(editingPreset.routes || {});
      } else {
        // Creating new preset
        setPresetName('');
        setSelectedRoutes({});
      }
      setSearchTerm('');
      setShowRouteBuilder(false);
      setNewRoute({ output: '', input: '' });
      setRouteBuilderSearch({ output: '', input: '' });
      setShowOutputDropdown(false);
      setShowInputDropdown(false);
    }
  }, [isOpen, editingPreset]);

  const getLabel = (type, index) => {
    return labels[type]?.[index]?.name || getDefaultLabel(type, index);
  };

  const handleSave = () => {
    if (!presetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    if (Object.keys(selectedRoutes).length === 0) {
      alert('Please add at least one route to the preset');
      return;
    }

    const preset = {
      id: editingPreset?.id || Date.now().toString(),
      name: presetName.trim(),
      routes: selectedRoutes,
      createdAt: editingPreset?.createdAt || new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    onSave(preset);
    onClose();
  };

  const handleAddFromCurrent = () => {
    setSelectedRoutes({ ...currentRoutes });
  };

  const handleRemoveRoute = (output) => {
    const newRoutes = { ...selectedRoutes };
    delete newRoutes[output];
    setSelectedRoutes(newRoutes);
  };

  const handleAddRoute = () => {
    if (newRoute.output !== '' && newRoute.input !== '') {
      // Check if output is already routed
      if (selectedRoutes.hasOwnProperty(newRoute.output.toString())) {
        alert(`Output ${formatDisplayNumber(newRoute.output)} is already routed. Please remove the existing route first.`);
        return;
      }
      
      setSelectedRoutes(prev => ({
        ...prev,
        [newRoute.output]: newRoute.input
      }));
      setNewRoute({ output: '', input: '' });
      setRouteBuilderSearch({ output: '', input: '' });
      setShowRouteBuilder(false);
    }
  };

  // Generate arrays for all 120 inputs and outputs
  const allOutputs = Array.from({ length: 120 }, (_, i) => i);
  const allInputs = Array.from({ length: 120 }, (_, i) => i);

  // Filter outputs based on search
  const filterOutputs = (search) => {
    if (!search) return allOutputs;
    
    return allOutputs.filter(output => {
      const label = getLabel('outputs', output).toLowerCase();
      const displayNumber = formatDisplayNumber(output);
      const searchLower = search.toLowerCase();
      
      return (
        label.includes(searchLower) ||
        displayNumber.includes(search) ||
        (output + 1).toString().includes(search) ||
        `out ${displayNumber}`.includes(searchLower) ||
        `output ${output + 1}`.includes(searchLower)
      );
    });
  };

  // Filter inputs based on search
  const filterInputs = (search) => {
    if (!search) return allInputs;
    
    return allInputs.filter(input => {
      const label = getLabel('inputs', input).toLowerCase();
      const displayNumber = formatDisplayNumber(input);
      const searchLower = search.toLowerCase();
      
      return (
        label.includes(searchLower) ||
        displayNumber.includes(search) ||
        (input + 1).toString().includes(search) ||
        `in ${displayNumber}`.includes(searchLower) ||
        `input ${input + 1}`.includes(searchLower)
      );
    });
  };

  const filteredCurrentRoutes = Object.entries(currentRoutes).filter(([output, input]) => {
    if (!searchTerm) return true;
    const outputLabel = getLabel('outputs', parseInt(output)).toLowerCase();
    const inputLabel = getLabel('inputs', input).toLowerCase();
    return (
      outputLabel.includes(searchTerm.toLowerCase()) ||
      inputLabel.includes(searchTerm.toLowerCase()) ||
      output.includes(searchTerm) ||
      input.toString().includes(searchTerm)
    );
  });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.relative')) {
        setShowOutputDropdown(false);
        setShowInputDropdown(false);
      }
    };

    if (showRouteBuilder) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showRouteBuilder]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-40 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 z-50 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <h2 className="text-xl font-semibold text-slate-200">
            {editingPreset ? 'Edit Preset' : 'Create New Preset'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-md transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Preset Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Preset Name
          </label>
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Enter preset name..."
            className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Route Management */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
          {/* Current Routes (Source) */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-200">Current Routes</h3>
              <button
                onClick={handleAddFromCurrent}
                className="flex items-center space-x-2 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add All Current</span>
              </button>
            </div>
            
            {/* Search Current Routes */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search current routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-600 rounded-md">
              {filteredCurrentRoutes.length > 0 ? (
                filteredCurrentRoutes.map(([output, input]) => (
                  <div
                    key={output}
                    className="p-3 border-b border-slate-600 last:border-b-0 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <div className="text-slate-200">
                          <span className="font-mono text-blue-400">OUT {formatDisplayNumber(parseInt(output))}:</span> {getLabel('outputs', parseInt(output))}
                        </div>
                        <div className="text-slate-400 mt-1">
                          → <span className="font-mono text-green-400">IN {formatDisplayNumber(input)}:</span> {getLabel('inputs', input)}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedRoutes(prev => ({ ...prev, [output]: input }))}
                        disabled={selectedRoutes[output] !== undefined}
                        className={`py-1 px-3 rounded text-xs font-medium transition-colors ${
                          selectedRoutes[output] !== undefined
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {selectedRoutes[output] !== undefined ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  {Object.keys(currentRoutes).length === 0 
                    ? 'No current routes available'
                    : `No routes found matching "${searchTerm}"`
                  }
                </div>
              )}
            </div>
          </div>

          {/* Selected Routes (Destination) */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-200">
                Preset Routes ({Object.keys(selectedRoutes).length})
              </h3>
              <button
                onClick={() => setShowRouteBuilder(!showRouteBuilder)}
                className="flex items-center space-x-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Route</span>
              </button>
            </div>

            {/* Manual Route Builder */}
            {showRouteBuilder && (
              <div className="mb-4 p-4 bg-slate-700 rounded-md border border-slate-600">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {/* Output Search */}
                  <div className="relative">
                    <label className="block text-xs text-slate-400 mb-1">Output</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input
                        type="text"
                        value={routeBuilderSearch.output}
                        onChange={(e) => {
                          setRouteBuilderSearch(prev => ({ ...prev, output: e.target.value }));
                          setShowOutputDropdown(true);
                        }}
                        onFocus={() => setShowOutputDropdown(true)}
                        placeholder="Search by name or number..."
                        className="w-full bg-slate-800 border border-slate-600 rounded pl-7 pr-2 py-1 text-sm text-white placeholder-slate-400"
                      />
                      {newRoute.output !== '' && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-400">
                          OUT {formatDisplayNumber(newRoute.output)}
                        </div>
                      )}
                    </div>
                    {/* Output Dropdown */}
                    {showOutputDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filterOutputs(routeBuilderSearch.output).slice(0, 10).map(output => {
                          const isAlreadyRouted = selectedRoutes.hasOwnProperty(output.toString());
                          return (
                            <button
                              key={output}
                              onClick={() => {
                                if (!isAlreadyRouted) {
                                  setNewRoute(prev => ({ ...prev, output }));
                                  setRouteBuilderSearch(prev => ({ ...prev, output: getLabel('outputs', output) }));
                                  setShowOutputDropdown(false);
                                }
                              }}
                              disabled={isAlreadyRouted}
                              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                                isAlreadyRouted 
                                  ? 'bg-slate-900 cursor-not-allowed opacity-50' 
                                  : 'hover:bg-slate-700 text-white'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className={`font-mono ${isAlreadyRouted ? 'text-slate-500' : 'text-blue-400'}`}>
                                    OUT {formatDisplayNumber(output)}:
                                  </span>{' '}
                                  <span className={isAlreadyRouted ? 'text-slate-500' : 'text-slate-200'}>
                                    {getLabel('outputs', output)}
                                  </span>
                                </div>
                                {isAlreadyRouted && (
                                  <span className="text-xs text-yellow-500">Already routed</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        {filterOutputs(routeBuilderSearch.output).length === 0 && (
                          <div className="px-3 py-2 text-sm text-slate-400">No outputs found</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Input Search */}
                  <div className="relative">
                    <label className="block text-xs text-slate-400 mb-1">Input</label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input
                        type="text"
                        value={routeBuilderSearch.input}
                        onChange={(e) => {
                          setRouteBuilderSearch(prev => ({ ...prev, input: e.target.value }));
                          setShowInputDropdown(true);
                        }}
                        onFocus={() => setShowInputDropdown(true)}
                        placeholder="Search by name or number..."
                        className="w-full bg-slate-800 border border-slate-600 rounded pl-7 pr-2 py-1 text-sm text-white placeholder-slate-400"
                      />
                      {newRoute.input !== '' && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-green-400">
                          IN {formatDisplayNumber(newRoute.input)}
                        </div>
                      )}
                    </div>
                    {/* Input Dropdown */}
                    {showInputDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filterInputs(routeBuilderSearch.input).slice(0, 10).map(input => (
                          <button
                            key={input}
                            onClick={() => {
                              setNewRoute(prev => ({ ...prev, input }));
                              setRouteBuilderSearch(prev => ({ ...prev, input: getLabel('inputs', input) }));
                              setShowInputDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors text-white"
                          >
                            <span className="font-mono text-green-400">IN {formatDisplayNumber(input)}:</span> <span className="text-slate-200">{getLabel('inputs', input)}</span>
                          </button>
                        ))}
                        {filterInputs(routeBuilderSearch.input).length === 0 && (
                          <div className="px-3 py-2 text-sm text-slate-400">No inputs found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAddRoute}
                  disabled={newRoute.output === '' || newRoute.input === ''}
                  className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded text-sm"
                >
                  Add Route
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto border border-slate-600 rounded-md">
              {Object.keys(selectedRoutes).length > 0 ? (
                Object.entries(selectedRoutes).map(([output, input]) => (
                  <div
                    key={output}
                    className="p-3 border-b border-slate-600 last:border-b-0 bg-slate-700/30"
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <div className="text-slate-200">
                          <span className="font-mono text-blue-400">OUT {formatDisplayNumber(parseInt(output))}:</span> {getLabel('outputs', parseInt(output))}
                        </div>
                        <div className="text-slate-400 mt-1">
                          → <span className="font-mono text-green-400">IN {formatDisplayNumber(input)}:</span> {getLabel('inputs', input)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveRoute(output)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  No routes added to preset yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700 mt-6">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-md font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!presetName.trim() || Object.keys(selectedRoutes).length === 0}
            className={`py-2 px-4 rounded-md font-semibold transition-colors ${
              !presetName.trim() || Object.keys(selectedRoutes).length === 0
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {editingPreset ? 'Save Changes' : 'Create Preset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePresetModal;