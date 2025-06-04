import React, { useState } from 'react';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import { formatDisplayNumber, getDefaultLabel } from '../utils/numberUtils';

const DestinationCard = ({ 
  outputIndex, 
  outputLabel, 
  connectedInput, 
  inputLabel, 
  onChangeSource, 
  onToggleLock,
  isLocked = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(outputLabel);

  const handleLabelEdit = () => {
    setIsEditing(true);
  };

  const handleLabelSave = () => {
    setIsEditing(false);
    // TODO: Implement label saving functionality
    console.log(`Save label for output ${outputIndex}: ${editedLabel}`);
  };

  const handleLabelCancel = () => {
    setIsEditing(false);
    setEditedLabel(outputLabel);
  };

  // formatIndex function removed - now using formatDisplayNumber from utils

  return (
    <div className="bg-slate-700 border border-slate-600 rounded-lg shadow-lg p-4 m-2">
      <div className="flex justify-between items-start">
        {/* Left: Output Info */}
        <div className="flex-1">
          {/* Output Index & Label */}
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-mono text-blue-400">
              OUT {formatDisplayNumber(outputIndex)}:
            </span>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedLabel}
                  onChange={(e) => setEditedLabel(e.target.value)}
                  className="bg-slate-800 border border-slate-500 rounded px-2 py-1 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onBlur={handleLabelSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLabelSave();
                    if (e.key === 'Escape') handleLabelCancel();
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={handleLabelEdit}
                className="text-slate-200 hover:text-white hover:underline"
              >
                {outputLabel || getDefaultLabel('outputs', outputIndex)}
              </button>
            )}
          </div>

          {/* Currently Routed Source */}
          <div className="mb-3">
            {connectedInput !== undefined ? (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Source:</span>
                <span className="text-sm font-mono text-green-400">
                  IN {formatDisplayNumber(connectedInput)}:
                </span>
                <span className="text-sm text-slate-200">
                  {inputLabel || getDefaultLabel('inputs', connectedInput)}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Source:</span>
                <span className="text-sm text-red-400">No Connection</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2 ml-4">
          {/* Lock/Unlock Button */}
          <button
            onClick={() => onToggleLock(outputIndex)}
            className={`p-2 rounded-md transition-colors ${
              isLocked 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-500 text-slate-300'
            }`}
            title={isLocked ? 'Unlock Output' : 'Lock Output'}
          >
            {isLocked ? (
              <LockClosedIcon className="w-4 h-4" />
            ) : (
              <LockOpenIcon className="w-4 h-4" />
            )}
          </button>

          {/* Change Source Button */}
          <button
            onClick={() => onChangeSource(outputIndex)}
            disabled={isLocked}
            className={`py-2 px-4 rounded-md font-semibold transition-colors ${
              isLocked
                ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500'
            }`}
          >
            Change Source
          </button>
        </div>
      </div>

      {/* Lock Status Indicator */}
      {isLocked && (
        <div className="mt-2 px-2 py-1 bg-red-900/50 border border-red-700 rounded text-xs text-red-300">
          🔒 Output is locked - unlock to make changes
        </div>
      )}
    </div>
  );
};

export default DestinationCard;