// migrations/20261125_00_add_disabled_to_users.js:
// Adds a 'disabled' boolean column to the 'users' table so accounts can be disabled/enabled.

const { DataTypes } = require('sequelize')

module.exports = {
  // 'up' runs automatically via Umzug when starting the app.
  up: async ({ context: queryInterface }) => {
    // Add 'disabled' boolean column to 'users'.
    // allowNull: false and defaultValue: false ensures that existing and new users default to active (not disabled).
    await queryInterface.addColumn('users', 'disabled', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    })
  },

  // 'down' reverses the schema change if rolling back this migration.
  down: async ({ context: queryInterface }) => {
    // Remove 'disabled' column from 'users' on rollback.
    await queryInterface.removeColumn('users', 'disabled')
  }
}