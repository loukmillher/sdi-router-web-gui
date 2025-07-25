const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Preset = sequelize.define('Preset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  routing: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    validate: {
      isValidRouting(value) {
        if (typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('Routing must be an object');
        }
        
        for (const [input, output] of Object.entries(value)) {
          const inputNum = parseInt(input);
          const outputNum = parseInt(output);
          
          if (isNaN(inputNum) || isNaN(outputNum)) {
            throw new Error('Routing keys and values must be numbers');
          }
          
          if (inputNum < 1 || inputNum > 120 || outputNum < 1 || outputNum > 120) {
            throw new Error('Input and output numbers must be between 1 and 120');
          }
        }
      }
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('Tags must be an array');
        }
      }
    }
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'presets',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeUpdate: (preset) => {
      preset.version += 1;
    }
  }
});

module.exports = Preset;