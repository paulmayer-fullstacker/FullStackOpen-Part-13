// migrations/20261119_00_add_reading_lists.js:
// Migration file creates the 'reading_lists' join table modeling the many-to-many relationship between users and blogs on their reading list.

const { DataTypes } = require('sequelize')

module.exports = {
  // 'up' runs automatically via Umzug when the server starts and applies the new reading_lists table.
  up: async ({ context: queryInterface }) => {
    // Create the 'reading_lists' join table
    await queryInterface.createTable('reading_lists', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      // Foreign key linking the reading list entry to a user.
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' }
      },
      // Foreign key linking the reading list entry to a blog
      blog_id: {
        type: DataTypes.INTEGER,

        allowNull: false,
        references: { model: 'blogs', key: 'id' }
      },
      // Track if the user has read the blog. Defaults false (unread), for new entries.
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      // Matching created_at / updated_at convention used in users and blogs tables.
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

  // 'down' reverses 'up' if this migration is rolled back.
  down: async ({ context: queryInterface }) => {
    // Drop the join table when rolling back.
    await queryInterface.dropTable('reading_lists')
  }
}

// Test:

// psql -U postgres -d blog_db

// SELECT * FROM migrations;

// \dt

// \d reading_lists

// \q