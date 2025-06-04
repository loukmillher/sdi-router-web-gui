import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from './Header';
import Footer from './Footer';
import DestinationCard from './DestinationCard';
import ChangeSourceModal from './ChangeSourceModal';
import { getDefaultLabel, formatDisplayNumber } from '../utils/numberUtils';

const RoutingView = ({ 
  connected,
  routes = {},
  labels = { inputs: {}, outputs: {} },
  onRoute,
  onLabelChange,
  onTabChange,
  activeTab = 'routing',
  connectionInfo = { host: '', port: '', connected: false }
}) => {
  const [lockedOutputs, setLockedOutputs] = useState(new Set());
  const [modalState, setModalState] = useState({
    isOpen: false,
    outputIndex: null,
    outputLabel: '',
    currentInput: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingInputLabel, setEditingInputLabel] = useState(null);
  const [editLabelValue, setEditLabelValue] = useState('');

  // Generate arrays for all 120 inputs and outputs
  const allInputs = Array.from({ length: 120 }, (_, i) => i);
  const allOutputs = Array.from({ length: 120 }, (_, i) => i);

  const getOutputLabel = (index) => {
    return labels.outputs?.[index]?.name || getDefaultLabel('outputs', index);
  };

  const getInputLabel = (index) => {
    return labels.inputs?.[index]?.name || getDefaultLabel('inputs', index);
  };

  // Filter outputs based on search term
  const filteredOutputs = allOutputs.filter(output => {
    if (!searchTerm) return true;
    
    const outputLabel = getOutputLabel(output).toLowerCase();
    const displayNumber = formatDisplayNumber(output);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      outputLabel.includes(searchLower) ||
      displayNumber.includes(searchTerm) ||
      (output + 1).toString().includes(searchTerm) ||
      `out ${displayNumber}`.includes(searchLower) ||
      `output ${output + 1}`.includes(searchLower)
    );
  });

  const handleChangeSource = (outputIndex) => {
    if (lockedOutputs.has(outputIndex)) return;
    
    setModalState({
      isOpen: true,
      outputIndex,
      outputLabel: getOutputLabel(outputIndex),
      currentInput: routes[outputIndex]
    });
  };

  const handleToggleLock = (outputIndex) => {
    setLockedOutputs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(outputIndex)) {
        newSet.delete(outputIndex);
      } else {
        newSet.add(outputIndex);
      }
      return newSet;
    });
  };

  const handleModalApply = (outputIndex, inputIndex) => {
    onRoute(outputIndex, inputIndex);
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      outputIndex: null,
      outputLabel: '',
      currentInput: null
    });
  };

  const handleSaveConfiguration = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement configuration saving logic
      console.log('Saving current configuration:', { routes, labels, lockedOutputs: Array.from(lockedOutputs) });
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or handle save logic here
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditInputLabel = (inputIndex) => {
    setEditingInputLabel(inputIndex);
    setEditLabelValue(getInputLabel(inputIndex));
  };

  const handleSaveInputLabel = () => {
    if (editingInputLabel !== null && onLabelChange) {
      const trimmedValue = editLabelValue.trim();
      if (trimmedValue.length > 0 && trimmedValue.length <= 20) {
        onLabelChange('input', editingInputLabel, trimmedValue);
      }
    }
    setEditingInputLabel(null);
    setEditLabelValue('');
  };

  const handleCancelInputLabel = () => {
    setEditingInputLabel(null);
    setEditLabelValue('');
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
        <div className="max-w-7xl mx-auto py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Title and Search */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-200">Destinations View</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage routing for all 120 outputs. Click "Change Source" to route inputs to outputs.
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search outputs by name or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
              
              {/* Search Results Info */}
              {searchTerm && (
                <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-md">
                  <p className="text-sm text-blue-300">
                    {filteredOutputs.length === 0 ? (
                      <>No outputs found matching "<span className="font-semibold">{searchTerm}</span>"</>
                    ) : filteredOutputs.length === allOutputs.length ? (
                      <>Showing all {allOutputs.length} outputs</>
                    ) : (
                      <>Showing {filteredOutputs.length} of {allOutputs.length} outputs matching "<span className="font-semibold">{searchTerm}</span>"</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Destination Cards Grid */}
            <div className="space-y-2">
              {filteredOutputs.map(outputIndex => (
                <DestinationCard
                  key={outputIndex}
                  outputIndex={outputIndex}
                  outputLabel={getOutputLabel(outputIndex)}
                  connectedInput={routes[outputIndex]}
                  inputLabel={routes[outputIndex] !== undefined ? getInputLabel(routes[outputIndex]) : undefined}
                  onChangeSource={handleChangeSource}
                  onToggleLock={handleToggleLock}
                  isLocked={lockedOutputs.has(outputIndex)}
                />
              ))}
            </div>

            {/* Empty States */}
            {filteredOutputs.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Outputs Found</h3>
                <p className="text-slate-400 mb-4">
                  No outputs match your search for "<span className="font-semibold">{searchTerm}</span>"
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {filteredOutputs.length > 0 && Object.keys(routes).length === 0 && !searchTerm && (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">No Active Routes</h3>
                <p className="text-slate-400">
                  {connected 
                    ? "Start by clicking 'Change Source' on any output to create your first route."
                    : "Connect to a VideoHub to begin routing."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        connectionInfo={connectionInfo}
        onSaveConfiguration={handleSaveConfiguration}
        isSaving={isSaving}
      />

      {/* Change Source Modal */}
      <ChangeSourceModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        outputIndex={modalState.outputIndex}
        outputLabel={modalState.outputLabel}
        currentInput={modalState.currentInput}
        inputs={allInputs}
        labels={labels}
        onApply={handleModalApply}
        editingInputLabel={editingInputLabel}
        editLabelValue={editLabelValue}
        onEditInputLabel={handleEditInputLabel}
        onSaveInputLabel={handleSaveInputLabel}
        onCancelInputLabel={handleCancelInputLabel}
        onEditLabelValueChange={setEditLabelValue}
      />
    </div>
  );
};

export default RoutingView;