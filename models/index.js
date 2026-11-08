// models/index.js
// Single export portal for all database models.

const Blog = require('./blog')
const User = require('./user')

// Synchronise the models with the Db schemas for Blogs and Users
Blog.sync()
User.sync()
// Export single object containing all Db schemas
module.exports = {
  Blog,
  User
}