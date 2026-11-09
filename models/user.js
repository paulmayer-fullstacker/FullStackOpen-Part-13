// models/user.js:

const { Model, DataTypes } = require('sequelize')

const { sequelize } = require('../utils/db')

class User extends Model {}
// Initialise User as a JS object
User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { // Validate object.
      // Sequelize built-in isEmail validator checks if the string passed to username matches standard email formatting.
      isEmail: {
        // If it fails: Sequelize prevents it from hitting the database and throws a SequelizeValidationError containing your custom error message.
        msg: "username must be a valid email address"
      }
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
},
// Config options passed as the model options object to Sequelize's .init() method.
// They tell Sequelize how this model should behave and interact with our PostgreSQL Db.
{
  sequelize,  // Passes our active Db connection instance (sequelize from util/db.js) to the model.
  underscored: true,  // Tells Sequelize to use snake_case for any auto generated columns or foreign keys. Keeps our database naming conventions consistent.
  timestamps: true,  // Sequelize will auto add timestamp (default) columns (created_at / updated_at) to the table.
  modelName: 'user'  // Sets the internal name of the model in singular form (user). For internal Sequelize tracking purposes.
})

module.exports = User