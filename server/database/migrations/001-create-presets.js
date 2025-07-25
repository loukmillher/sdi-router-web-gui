'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      routing: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 'general'
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      updated_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('presets', ['name']);
    await queryInterface.addIndex('presets', ['category']);
    await queryInterface.addIndex('presets', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('presets');
  }
};