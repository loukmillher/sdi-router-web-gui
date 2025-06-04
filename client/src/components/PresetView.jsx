import React, { useState, useEffect } from 'react';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import Header from './Header';
import Footer from './Footer';
import PresetCard from './PresetCard';
import CreatePresetModal from './CreatePresetModal';

const PresetView = ({ 
  connected,
  routes = {},
  labels = { inputs: {}, outputs: {} },
  onRoute,
  onTabChange,
  activeTab = 'presets',
  connectionInfo = { host: '', port: '', connected: false },
  onPresetSelect
}) => {
  const [presets, setPresets] = useState([]);
  const [activePresetId, setActivePresetId] = useState(null);
  const [applyingPresetId, setApplyingPresetId] = useState(null);
  const [modalState, setModalState] = useState({
    isOpen: false,
    editingPreset: null
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize with empty presets array - no defaults
  useEffect(() => {
    setPresets([]);
  }, []);

  const handleCreatePreset = () => {
    setModalState({
      isOpen: true,
      editingPreset: null
    });
  };

  const handleEditPreset = (preset) => {
    setModalState({
      isOpen: true,
      editingPreset: preset
    });
  };

  const handleDuplicatePreset = (preset) => {
    const duplicatedPreset = {
      ...preset,
      id: Date.now().toString(),
      name: `${preset.name} (Copy)`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setPresets(prev => [...prev, duplicatedPreset]);
  };

  const handleDeletePreset = (presetId) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    if (activePresetId === presetId) {
      setActivePresetId(null);
    }
  };

  const handleSavePreset = (preset) => {
    if (preset.id && presets.find(p => p.id === preset.id)) {
      // Update existing preset
      setPresets(prev => prev.map(p => p.id === preset.id ? preset : p));
    } else {
      // Create new preset
      setPresets(prev => [...prev, preset]);
    }
  };

  const handleApplyPreset = async (presetId) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setApplyingPresetId(presetId);
    
    try {
      // Apply the preset routes
      onPresetSelect(presetId);
      
      // Update preset with last applied time
      const updatedPreset = {
        ...preset,
        lastApplied: new Date().toISOString()
      };
      setPresets(prev => prev.map(p => p.id === presetId ? updatedPreset : p));
      setActivePresetId(presetId);
      
      // Simulate some delay for the applying state
      setTimeout(() => {
        setApplyingPresetId(null);
      }, 1000);
    } catch (error) {
      console.error('Failed to apply preset:', error);
      setApplyingPresetId(null);
    }
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      editingPreset: null
    });
  };

  const handleSaveConfiguration = async () => {
    // TODO: Implement configuration saving
    console.log('Saving presets configuration:', presets);
    alert('Presets configuration saved successfully!');
  };

  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current routes match any preset
  useEffect(() => {
    const currentRouteStr = JSON.stringify(routes);
    const matchingPreset = presets.find(preset => 
      JSON.stringify(preset.routes) === currentRouteStr
    );
    setActivePresetId(matchingPreset?.id || null);
  }, [routes, presets]);

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
            {/* Title and Actions */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-200">Preset Management</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Create, edit, and apply routing presets for quick configuration changes.
                </p>
              </div>
              <button
                onClick={handleCreatePreset}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-colors focus:ring-2 focus:ring-blue-500"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Preset</span>
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Presets Grid */}
            {filteredPresets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPresets.map(preset => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onApply={handleApplyPreset}
                    onEdit={handleEditPreset}
                    onDelete={handleDeletePreset}
                    onDuplicate={handleDuplicatePreset}
                    isApplying={applyingPresetId === preset.id}
                    isActive={activePresetId === preset.id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">
                  <FolderIcon className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-slate-300 mb-2">
                  {searchTerm ? 'No presets found' : 'No presets created yet'}
                </h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm 
                    ? `No presets match "${searchTerm}"`
                    : 'Create your first preset to quickly apply common routing configurations.'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={handleCreatePreset}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-colors"
                  >
                    Create Your First Preset
                  </button>
                )}
              </div>
            )}

            {/* Current Configuration Info */}
            {Object.keys(routes).length > 0 && (
              <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Current Configuration</h3>
                <p className="text-sm text-slate-400">
                  {Object.keys(routes).length} routes active
                  {activePresetId ? (
                    <span className="ml-2 text-green-400">
                      (matches "{presets.find(p => p.id === activePresetId)?.name}")
                    </span>
                  ) : (
                    <span className="ml-2 text-yellow-400">(custom configuration)</span>
                  )}
                </p>
                {!activePresetId && (
                  <button
                    onClick={handleCreatePreset}
                    className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded transition-colors"
                  >
                    Save as Preset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer 
        connectionInfo={connectionInfo}
        onSaveConfiguration={handleSaveConfiguration}
        isSaving={false}
      />

      {/* Create/Edit Preset Modal */}
      <CreatePresetModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        onSave={handleSavePreset}
        currentRoutes={routes}
        labels={labels}
        editingPreset={modalState.editingPreset}
      />
    </div>
  );
};

export default PresetView;