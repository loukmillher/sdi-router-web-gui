'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('preset_history', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      preset_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'presets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('created', 'updated', 'applied', 'deleted', 'restored'),
        allowNull: false
      },
      previous_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      new_data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      performed_by: {
        type: Sequelize.STRING,
        allowNull: true
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      success: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      error_message: {
        type: Sequelize.TEXT,
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
      }
    });

    await queryInterface.addIndex('preset_history', ['preset_id']);
    await queryInterface.addIndex('preset_history', ['action']);
    await queryInterface.addIndex('preset_history', ['performed_by']);
    await queryInterface.addIndex('preset_history', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('preset_history');
  }
};