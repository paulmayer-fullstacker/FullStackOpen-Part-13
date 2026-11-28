// models/index.js:
// Single export portal for all database models.

const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./reading_list') // Import ReadingList join table model for the reading list many-to-many relationship.
const Session = require('./session') // Import Session model so it is registered and exported with all models.

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

// Direct super many-to-many associations on ReadingList so it can be queried directly
// or via the many-to-many 'readings' / 'readingListUsers' associations without needing syncModels.
User.hasMany(ReadingList)
ReadingList.belongsTo(User)
// Alias the Blog -> ReadingList association as 'readingList' so nested includes or queries
// from Blog reference the join entry under 'readingList' rather than Sequelize's default name.
Blog.hasMany(ReadingList, { as: 'readingList' })
// Explicitly alias ReadingList -> Blog as 'blog' so querying from ReadingList back to its
// associated Blog uses 'blog' consistently (avoiding ambiguity should multiple Blog links exist).
ReadingList.belongsTo(Blog, { as: 'blog' })
// Define the one-to-many relationship between User and Session:
// A user can have many active sessions (across devices/logins), and each session belongs to one user (via user_id).
User.hasMany(Session)
Session.belongsTo(User)

// Export all database models from a single entry point (schema migrations now managed by umzug).
module.exports = {
  Blog,
  User,
  ReadingList,
  Session, // Add Session to the export object.
}