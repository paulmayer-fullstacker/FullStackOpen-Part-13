// // migrations/20261118_00_initialise_users_and_blogs.js:

const { DataTypes } = require('sequelize')

module.exports = {
  // 'up' runs automatically when the server starts and applies the schema change
  up: async ({ context: queryInterface }) => {
    // Add 'year' column. addColumn modifies an existing table in place without touching existing data.
    await queryInterface.addColumn('blogs', 'year', {
      type: DataTypes.INTEGER,
      allowNull: true // Default value. Allow for blogs created before this added field.
      // However, when 'year' value is provided Sequelize's model validator will validate.
    })
  },

  // 'down' runs if we roll back this migration, reversing 'up'. Mirrors 'up'.
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('blogs', 'year')
  },
}