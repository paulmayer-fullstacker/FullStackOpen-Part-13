// models/reading_list.js:
// Join table model for reading list. 
// Represents a single entry connecting a user to a blog in their reading list, also if the user has read the blog.

const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../utils/db')

// Define the ReadingList model class extending Sequelize's Model:
class ReadingList extends Model {}
// Initialise ReadingList attributes and model configuration
ReadingList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Maps to 'user_id' column in 'reading_lists'. snake-to-camel case via underscored: true
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' }
    },
    // Maps to 'blog_id' column in 'reading_lists'.
    blogId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'blogs', key: 'id' }
    },
    // Tracks read status; defaults to false (unread) when a blog is added.
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    // Converts camelCase attributes (i.e., userId, blogId) to snake_case columns (user_id, blog_id) in PostgreSQL.
    underscored: true,
    // Timestamps are enabled by default (true) to match created_at and updated_at columns created in the migration.
    modelName: 'reading_list'
  }
)

module.exports = ReadingList