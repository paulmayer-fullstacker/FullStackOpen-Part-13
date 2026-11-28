// models/session.js:
// Sequelize model representing active login sessions stored in the 'sessions' table.

const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../utils/db')

// Define the Session model class extending Sequelize's Model:
class Session extends Model {}
// Initialise Session: Configures the Session model's columns and database options.
Session.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Foreign key linking each session row to its owning user (maps to 'user_id' via underscored: true).
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  // Stores the active JWT token issued during POST /api/login.
  token: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  sequelize,
  underscored: true, // Maps camelCase attributes like userId / createdAt to snake_case user_id / created_at.
  timestamps: true, // Automatically manages created_at and updated_at.
  modelName: 'session', // Internal Sequelize model name.
  tableName: 'sessions' // Explicitly targets the 'sessions' table created by migration.
})

module.exports = Session