const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PresetHistory = sequelize.define('PresetHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  presetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'presets',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('created', 'updated', 'applied', 'deleted', 'restored'),
    allowNull: false
  },
  previousData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  newData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  success: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'preset_history',
  timestamps: true,
  underscored: true,
  updatedAt: false
});

module.exports = PresetHistory;