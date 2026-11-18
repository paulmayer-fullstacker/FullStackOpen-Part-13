// migrations/20261117_00_initialise_users_and_blogs.js:

const { DataTypes } = require('sequelize')

module.exports = {
  // 'up' describes how the database should be modified when running the migration.
  up: async ({ context: queryInterface }) => {
    // Create the 'users' table
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Note: snake_case is used in migrations to match database columns, rather than camel.
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      // Explicit timestamps are required for users table.
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    })

    // Create the 'blogs' table
    await queryInterface.createTable('blogs', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      author: {
        type: DataTypes.TEXT
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      title: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      // Foreign key linking each blog to its creator in the users table.
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      // Required explicit timestamps for blogs table.
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

  // 'down' describes how to undo this migration if a rollback is triggered.
  down: async ({ context: queryInterface }) => {
    await queryInterface.dropTable('blogs')
    await queryInterface.dropTable('users')
  },
}