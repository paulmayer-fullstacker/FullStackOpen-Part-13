// models/index.js
// Single export portal for all database models.

const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./reading_list') // Import ReadingList join table model for the reading list many-to-many relationship.

// Define the one-to-many relationship between users and blogs. A user can have many blogs, and a blog belongs to just one user.
// Sequelize will automatically set up a foreign key (user_id) on the blogs table, linking each blog to its creator.
User.hasMany(Blog)
Blog.belongsTo(User)

// Define the many-to-many relationship between User and Blog through the 'reading_lists' join table.
// Using the alias 'readings' (matching the GET /api/users/:id response shape) keeps this
// reading-list relationship distinct from the blogs created by the user (User.hasMany(Blog)).
User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })
// Define the reverse many-to-many relationship between Blog and User through the 'reading_lists' join table.
// Using an alias ('readingListUsers') keeps users who have the blog on their reading list distinct from the blog's creator relationship.
Blog.belongsToMany(User, { through: ReadingList, as: 'readingListUsers' })

// Export single object containing all Db schemas and the synchModels.
module.exports = {
  Blog,
  User,
  ReadingList,
}