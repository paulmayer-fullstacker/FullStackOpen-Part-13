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
// Using an alias ('readingListBlogs') keeps reading-list blogs relationship distinct from blogs created by the user relationship.
User.belongsToMany(Blog, { through: ReadingList, as: 'readingListBlogs' })
// Define the reverse many-to-many relationship between Blog and User through the 'reading_lists' join table.
// Using an alias ('readingListUsers') keeps users who have the blog on their reading list distinct from the blog's creator relationship.
Blog.belongsToMany(User, { through: ReadingList, as: 'readingListUsers' })

// // NOTE: syncModels has been completely removed. 
// // Database schema management is now handled entirely by our migrations and Umzug.
// // Synchronise the models with the Db schemas for Blogs and Users
// const syncModels = async () => {
//   // User must be synced before Blog because Blog will reference the User's id.
//   await User.sync({ alter: true }) // alter: true will apply any schema changes to the Db.
//   await Blog.sync({ alter: true })
// }

// Export single object containing all Db schemas and the synchModels.
module.exports = {
  Blog,
  User,
  ReadingList,
 // syncModels
}