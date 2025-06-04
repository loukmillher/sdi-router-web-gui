import React from 'react';

const PresetButtons = ({ onPresetSelect }) => {
  const presets = [
    { id: 1, name: 'Preset 1', color: 'bg-blue-600' },
    { id: 2, name: 'Preset 2', color: 'bg-green-600' },
    { id: 3, name: 'Preset 3', color: 'bg-purple-600' },
    { id: 4, name: 'Preset 4', color: 'bg-orange-600' },
  ];

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Quick Presets</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {presets.map(preset => (
          <button
            key={preset.id}
            className={`preset-button ${preset.color} hover:opacity-90 text-white`}
            onClick={() => onPresetSelect(preset.id)}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetButtons;