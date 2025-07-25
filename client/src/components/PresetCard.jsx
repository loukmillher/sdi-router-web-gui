import React, { useState } from 'react';
import { 
  PlayIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const PresetCard = ({ 
  preset,
  onApply,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  isApplying = false,
  isActive = false
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const formatRouteCount = (routes) => {
    const count = Object.keys(routes || {}).length;
    return `${count} route${count !== 1 ? 's' : ''}`;
  };

  const getRoutePreview = (routes) => {
    const routeEntries = Object.entries(routes || {});
    if (routeEntries.length === 0) return 'No routes configured';
    
    const preview = routeEntries.slice(0, 3).map(([output, input]) => 
      `Out ${output} → In ${input}`
    ).join(', ');
    
    if (routeEntries.length > 3) {
      return `${preview}, +${routeEntries.length - 3} more`;
    }
    return preview;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleApply = () => {
    onApply(preset.id);
  };

  const handleDelete = () => {
    if (showConfirmDelete) {
      onDelete(preset.id);
      setShowConfirmDelete(false);
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  return (
    <div className={`bg-slate-700 border rounded-lg shadow-lg p-4 transition-all ${
      isActive 
        ? 'border-green-500 ring-2 ring-green-500/20' 
        : 'border-slate-600 hover:border-slate-500'
    }`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-200 mb-1">
            {preset.name}
          </h3>
          <div className="text-sm text-slate-400 space-y-1">
            <div className="flex items-center space-x-3">
              <span>{formatRouteCount(preset.routing)}</span>
              {preset.category && (
                <div className="flex items-center space-x-1">
                  <FolderIcon className="w-3 h-3" />
                  <span>{preset.category}</span>
                </div>
              )}
            </div>
            {preset.updatedAt && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-3 h-3" />
                <span>Updated: {formatDate(preset.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
        
        {isActive && (
          <div className="flex items-center space-x-1 bg-green-900/50 px-2 py-1 rounded text-xs text-green-300">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Active</span>
          </div>
        )}
      </div>

      {/* Description */}
      {preset.description && (
        <div className="mb-3">
          <p className="text-sm text-slate-300 italic">
            {preset.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {preset.tags && preset.tags.length > 0 && (
        <div className="mb-3 flex items-center space-x-2">
          <TagIcon className="w-3 h-3 text-slate-400" />
          <div className="flex flex-wrap gap-1">
            {preset.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Route Preview */}
      <div className="mb-4">
        <p className="text-sm text-slate-300 bg-slate-800 rounded p-2 font-mono">
          {getRoutePreview(preset.routing)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        {/* Primary Action - Apply */}
        <button
          onClick={handleApply}
          disabled={isApplying || isActive}
          className={`flex items-center space-x-2 py-2 px-4 rounded-md font-semibold transition-colors ${
            isActive
              ? 'bg-green-600 text-white cursor-default'
              : isApplying
                ? 'bg-blue-400 text-white cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500'
          }`}
        >
          <PlayIcon className="w-4 h-4" />
          <span>
            {isActive ? 'Applied' : isApplying ? 'Applying...' : 'Apply Preset'}
          </span>
        </button>

        {/* Secondary Actions */}
        <div className="flex items-center space-x-2">
          {onExport && (
            <button
              onClick={() => onExport(preset.id)}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-md transition-colors"
              title="Export Preset"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={() => onDuplicate(preset)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-md transition-colors"
            title="Duplicate Preset"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onEdit(preset)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-md transition-colors"
            title="Edit Preset"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={showConfirmDelete ? handleCancelDelete : handleDelete}
            className={`p-2 rounded-md transition-colors ${
              showConfirmDelete
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600'
                : 'text-red-400 hover:text-red-300 hover:bg-red-900/50'
            }`}
            title={showConfirmDelete ? 'Cancel Delete' : 'Delete Preset'}
          >
            {showConfirmDelete ? (
              <span className="text-xs px-2">Cancel</span>
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
          
          {showConfirmDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-red-300 hover:text-red-200 bg-red-900/70 hover:bg-red-900 rounded-md transition-colors text-xs px-2"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresetCard;