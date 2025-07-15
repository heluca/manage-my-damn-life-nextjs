'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      settings_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      userid: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      global: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      value: {
        type: Sequelize.STRING(1000),
        allowNull: true
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('settings');
  }
};
