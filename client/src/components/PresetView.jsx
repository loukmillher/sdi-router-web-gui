import React, { useState, useEffect } from 'react';
import { PlusIcon, FolderIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Header from './Header';
import Footer from './Footer';
import PresetCard from './PresetCard';
import CreatePresetModal from './CreatePresetModal';
import presetApi from '../services/presetApi';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch presets from API
  useEffect(() => {
    fetchPresets();
    fetchCategories();
  }, []);

  const fetchPresets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await presetApi.fetchPresets({ 
        limit: 100,
        category: selectedCategory || undefined 
      });
      setPresets(data.presets);
    } catch (err) {
      setError('Failed to load presets');
      console.error('Error fetching presets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await presetApi.getCategories();
      setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

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

  const handleDuplicatePreset = async (preset) => {
    try {
      const duplicatedData = {
        name: `${preset.name} (Copy)`,
        description: preset.description,
        routing: preset.routing,
        category: preset.category,
        tags: preset.tags
      };
      await presetApi.createPreset(duplicatedData);
      fetchPresets();
    } catch (err) {
      setError(`Failed to duplicate preset: ${err.message}`);
    }
  };

  const handleDeletePreset = async (presetId) => {
    if (!window.confirm('Are you sure you want to delete this preset?')) return;
    
    try {
      await presetApi.deletePreset(presetId);
      if (activePresetId === presetId) {
        setActivePresetId(null);
      }
      fetchPresets();
    } catch (err) {
      setError(`Failed to delete preset: ${err.message}`);
    }
  };

  const handleSavePreset = async (preset) => {
    try {
      if (preset.id) {
        // Update existing preset
        await presetApi.updatePreset(preset.id, preset);
      } else {
        // Create new preset
        await presetApi.createPreset(preset);
      }
      fetchPresets();
      handleModalClose();
    } catch (err) {
      setError(`Failed to save preset: ${err.message}`);
    }
  };

  const handleApplyPreset = async (presetId) => {
    if (!connected) {
      setError('Cannot apply preset: VideoHub not connected');
      return;
    }

    setApplyingPresetId(presetId);
    
    try {
      const result = await presetApi.applyPreset(presetId);
      
      if (result.success) {
        setActivePresetId(presetId);
        // Notify parent component to refresh routes
        if (onPresetSelect) {
          onPresetSelect(presetId);
        }
      } else {
        setError('Some routes failed to apply');
      }
    } catch (err) {
      setError(`Failed to apply preset: ${err.message}`);
    } finally {
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
    try {
      const backup = await presetApi.backupPresets();
      alert(`Backup created successfully: ${backup.filename}`);
    } catch (err) {
      setError(`Failed to create backup: ${err.message}`);
    }
  };

  const handleExportPreset = async (presetId) => {
    try {
      const { blob, filename } = await presetApi.exportPreset(presetId);
      presetApi.downloadBlob(blob, filename);
    } catch (err) {
      setError(`Failed to export preset: ${err.message}`);
    }
  };

  const handleImportPreset = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await presetApi.importPreset(file);
      fetchPresets();
    } catch (err) {
      setError(`Failed to import preset: ${err.message}`);
    }
    
    // Reset file input
    event.target.value = '';
  };

  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if current routes match any preset
  useEffect(() => {
    const currentRouteStr = JSON.stringify(routes);
    const matchingPreset = presets.find(preset => 
      JSON.stringify(preset.routing) === currentRouteStr
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
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="import-preset"
                  accept=".json"
                  onChange={handleImportPreset}
                  className="hidden"
                />
                <label
                  htmlFor="import-preset"
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-semibold transition-colors cursor-pointer"
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                  <span>Import</span>
                </label>
                <button
                  onClick={handleCreatePreset}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-colors focus:ring-2 focus:ring-blue-500"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Preset</span>
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 bg-red-900/50 border border-red-700 rounded-lg p-4 text-red-300 flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-200"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-6 flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search presets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 max-w-md bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {categories.length > 0 && (
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    fetchPresets();
                  }}
                  className="bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Presets Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2 text-slate-400">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Loading presets...</span>
                </div>
              </div>
            ) : filteredPresets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPresets.map(preset => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onApply={handleApplyPreset}
                    onEdit={handleEditPreset}
                    onDelete={handleDeletePreset}
                    onDuplicate={handleDuplicatePreset}
                    onExport={handleExportPreset}
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