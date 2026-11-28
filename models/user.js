// models/user.js:

// Import Model and DataTypes from Sequelize to define the User table schema and instance behavior.
const { Model, DataTypes } = require('sequelize')
// Import the configured Sequelize database connection instance.
const { sequelize } = require('../utils/db')
// Define the User model class extending Sequelize's base Model class.
class User extends Model {}
// Initialise User: Configures the User model's columns and database options. as a JS object
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
        // If it fails: Sequelize prevents it from hitting the database and throws a SequelizeValidationError containing our custom error message.
        msg: "username must be a valid email address"
      }
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // passwordHash field stores the encrypted bcrypt password string in the database.
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // disabled: boolean flag indicating whether the user account is disabled.
  disabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
},
// Config options passed as the model options object to Sequelize's .init() method.
// They tell Sequelize how this model should behave and interact with our PostgreSQL Db.
{
  sequelize,  // Passes our active Db connection instance (sequelize from util/db.js) to the model.
  underscored: true,  // Tells Sequelize to use snake_case for any auto generated columns or foreign keys. Keeps our database naming conventions consistent.
  timestamps: true,  // Sequelize will auto add timestamp (default) columns (created_at / updated_at) to the table.
  modelName: 'user',  // Sets the internal name of the model in singular form (user). For internal Sequelize tracking purposes
  // DefaultScope applies to User queries (like findAll, findByPk), unless overridden with .unscoped() or explicit attributes.
  defaultScope: {
    // Uses Sequelize's `exclude` option so `passwordHash` is omitted from SELECT queries and responses (e.g., POST /api/users, GET /api/users) by default.
    attributes: { exclude: ['passwordHash'] }
  }
})

module.exports = User
/*
// Alternative Approach: Hiding passwordHash via toJSON() Instead of defaultScope & unscoped()
// Instead of excluding passwordHash at the SQL query level with defaultScope in models/user.js and opting in with User.unscoped() in controllers/login.js, a toJSON() instance method can be defined on the User model to strip passwordHash during JSON serialization (a pattern seen in Classsed tutorials).
// Example toJSON() Implementation on User
// toJSON() {
//   const values = { ...this.get() }
//   delete values.passwordHash
//   return values
// }

// Query vs. Serialization: 
// defaultScope with attributes: { exclude: ['passwordHash'] } prevents PostgreSQL from selecting password_hash in normal SELECT queries, requiring User.unscoped() in controllers/login.js when bcrypt.compare needs user.passwordHash. 
// By contrast, toJSON() runs automatically when Express serializes a model instance via res.json(...), so passwordHash can still be present on the model instance in memory (such as during login or right after User.create(...)) without being sent in the HTTP JSON response.
// Pros: Avoids needing .unscoped() on login queries and removes passwordHash even on objects returned directly from User.create(...) without an extra findByPk call.
// Cons: password_hash is still fetched from the database on normal queries unless also excluded in query attributes or defaultScope, and any internal code inspecting user.passwordHash directly in memory would still see it if loaded.
*/