// models/index.js
// Single export portal for all database models.

const Blog = require('./blog')

// Synchronise the model with the Db schema for Blogs
Blog.sync()
// Export single object containing all Db schemas
module.exports = {
  Blog,
}