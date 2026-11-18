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
  },
  // Insert and validate year field:
  year: {
    type: DataTypes.INTEGER,
    // Sequelize's built-in validation rules run automatically before INSERT or UPDATE queries.
    // If any rule fails, Sequelize throws a 'SequelizeValidationError' which our centralised
    // errorHandler middleware (in utils/middleware.js) catches and returns as a 400 Bad Request.
    validate: {
      // Ensures the value is a whole number (blocks floats or non-numeric strings)
      isInt: {
        msg: 'Year must be an integer'
      },
      // Enforce min allowable year (1991).
      min: {
        args: [1991],
        msg: 'Earliest allowed year is 1991'
      },
      // Enforce max allowable year (date.today).
      // Custom validator function used instead of a static 'max' number so the upper bound
      // dynamically evaluates the current year at the exact moment a request is processed
      maxYear(value) {
        // new Date() creates a new JS Date object representing the current date/time according to the system's local clock.
        //n.getFullYear(): Extracts the four-digit calendar year as an integer, from the date object.
        const currentYear = new Date().getFullYear()
        if (value > currentYear) {
          throw new Error(`Year cannot be beyond the current year (${currentYear})`)
        }
      }
    }
  }
}, 
// Config options passed as the model options object to Sequelize's .init() method.
//  They tell Sequelize how this model should behave and interact with our PostgreSQL Db.
{
  sequelize,  // Passes our active Db connection instance (sequelize from util/db.js) to the model.
  underscored: true,  // Tells Sequelize to use snake_case for any auto generated columns or foreign keys. Keeps our database naming conventions consistent.
  // timestamps: false,  // Default to true. For Chapter-4, timestamps are now required.
  modelName: 'blog'  // Sets the internal name of the model in singular form (blog). For internal Sequelize tracking purposes.
})

module.exports = Blog