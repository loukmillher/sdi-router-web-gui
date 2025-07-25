const sequelize = require('../database');
const Preset = require('./Preset');
const PresetHistory = require('./PresetHistory');

// Define associations
Preset.hasMany(PresetHistory, {
  foreignKey: 'presetId',
  as: 'history'
});

PresetHistory.belongsTo(Preset, {
  foreignKey: 'presetId',
  as: 'preset'
});

module.exports = {
  sequelize,
  Preset,
  PresetHistory
};