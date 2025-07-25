'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
      
              // emailVerified column is now added in the consolidated migration
              // queryInterface.addColumn("users", "emailVerified",{
              //   type: Sequelize.DATE,
              // },
              // {transaction: t}),
              queryInterface.addColumn("sessions", "sessionToken",{
                type: Sequelize.STRING,
                unique: "sessionToken",
                allowNull: true,
            }, {transaction: t}),
              queryInterface.addColumn("sessions", "userId",{
                type: Sequelize.STRING
            }, {transaction: t}),
            queryInterface.createTable('verification_tokens', {
                token: { type: Sequelize.STRING, primaryKey: true },
                identifier: { type: Sequelize.STRING, allowNull: false },
                expires: { type: Sequelize.DATE, allowNull: false },
            }, {transaction: t}),
            queryInterface.addColumn("accounts", "providerAccountId",{
                type: Sequelize.STRING,
            }, {transaction: t}),
            queryInterface.addColumn("accounts", "userId",{
                type: Sequelize.STRING
            }, {transaction: t}),

            ]);
          });
      
    },
    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction(t => {
            return Promise.all([
              // emailVerified column is now handled in the consolidated migration
              // queryInterface.removeColumn("users", "emailVerified",{transaction:t}),
              queryInterface.removeColumn("sessions", "sessionToken",{transaction:t}),
              queryInterface.removeColumn("sessions", "userId",{transaction:t}),
              queryInterface.dropTable('verification_tokens',{transaction:t}),
              queryInterface.removeColumn("accounts", "providerAccountId",{transaction:t}),
              // queryInterface.removeColumn("accounts", "userId",{transaction:t}),

              
            ])
        })
    }
}