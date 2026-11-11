// models/index.js
// Single export portal for all database models.

const Blog = require('./blog')
const User = require('./user')

// Define the one-to-many relationship between users and blogs. A user can have many blogs, and a blog belongs to just one user.
// Sequelize will automatically set up a foreign key (user_id) on the blogs table, linking each blog to its creator.
User.hasMany(Blog)
Blog.belongsTo(User)

// Synchronise the models with the Db schemas for Blogs and Users
const syncModels = async () => {
  // User must be synced before Blog because Blog will reference the User's id.
  await User.sync({ alter: true }) // alter: true will apply any schema changes to the Db.
  await Blog.sync({ alter: true })
}

// Export single object containing all Db schemas and the synchModels.
module.exports = {
  Blog,
  User,
  syncModels
}