// migrations/20261125_01_create_sessions.js:
// Creates the 'sessions' table to store active user login sessions for server-side session checks.

const { DataTypes } = require('sequelize')

module.exports = {
  // 'up' runs automatically via Umzug and creates the 'sessions' table in PostgreSQL.
  up: async ({ context: queryInterface }) => {
    // Create 'sessions' table to track active sessions/tokens.
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Foreign key referencing users.id; if a user row is deleted, their sessions cascade-delete automatically.
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      // Stores the JWT issued on login so requests can verify the session exists and logout can revoke it.
      token: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      // Explicit timestamps matching the convention in users, blogs, and reading_lists.
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    })
  },

  // 'down' drops the 'sessions' table if this migration is rolled back.
  down: async ({ context: queryInterface }) => {
    // Drop 'sessions' table on rollback.
    await queryInterface.dropTable('sessions')
  }
}

// Test Success:

// psql postgres://postgres:root@localhost:5432/blog_db

// SELECT * FROM migrations;

// \dt
// \d users
// \d sessions
// \q