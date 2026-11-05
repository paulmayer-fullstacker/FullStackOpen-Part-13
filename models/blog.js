// models/blog.js:

const { Model, DataTypes } = require('sequelize')
const { sequelize } = require('../utils/db')

class Blog extends Model {}
// Initialise Blog as a JS object
Blog.init({
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
  }
}, 
// Config options passed as the model options object to Sequelize's .init() method.
//  They tell Sequelize how this model should behave and interact with our PostgreSQL database.
{
  sequelize,  // Passes our active database connection instance (sequelize from util/db.js) to the model.
  underscored: true,  // Tells Sequelize to use snake_case for any auto generated columns or foreign keys. Keeps our database naming conventions consistent.
  timestamps: false,  // As id used as primary key, Sequelize should not auto add timestamp columns (created_at / updated_at) to the table
  modelName: 'blog'  // Sets the internal name of the model in singular form (blog). For internal Sequelize tracking purposes.
})

module.exports = Blog