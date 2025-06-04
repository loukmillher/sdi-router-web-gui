import React, { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import DestinationCard from './DestinationCard';
import ChangeSourceModal from './ChangeSourceModal';
import { getDefaultLabel } from '../utils/numberUtils';

const RoutingView = ({ 
  connected,
  routes = {},
  labels = { inputs: {}, outputs: {} },
  onRoute,
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

  // Generate arrays for all 120 inputs and outputs
  const allInputs = Array.from({ length: 120 }, (_, i) => i);
  const allOutputs = Array.from({ length: 120 }, (_, i) => i);

  const getOutputLabel = (index) => {
    return labels.outputs?.[index]?.name || getDefaultLabel('outputs', index);
  };

  const getInputLabel = (index) => {
    return labels.inputs?.[index]?.name || getDefaultLabel('inputs', index);
  };

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
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-200">Destinations View</h2>
              <p className="text-sm text-slate-400 mt-1">
                Manage routing for all 120 outputs. Click "Change Source" to route inputs to outputs.
              </p>
            </div>

            {/* Destination Cards Grid */}
            <div className="space-y-2">
              {allOutputs.map(outputIndex => (
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

            {/* Empty State */}
            {Object.keys(routes).length === 0 && (
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
      />
    </div>
  );
};

export default RoutingView;