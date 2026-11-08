// seed.js:
// Script to reset and seed the Db with initial blog and user data.

require('dotenv').config()
const { sequelize } = require('./utils/db')
const { User, Blog } = require('./models') // Import User and Blog from our centralised models entry point.
const seedUsers = require('./utils/seedingUserData')  // Import our seeding users data object (array).
const seedBlogs = require('./utils/seedingBlogData') // Import our seeding blogs data object (array).

const seedDatabase = async () => {
  try {
    // Authenticate Db connection.
    await sequelize.authenticate()
    console.log('Connected to Db, ready for seeding.')

    // Drop all tables and recreate them cleanly based on model definitions (force: true drops existing tables).
    await sequelize.sync({ force: true })
    console.log('All database tables dropped and recreated.')

    // Seed Users first. Loop through the imported user array creating a row for each user.
    for (let user of seedUsers) {
      await User.create(user)
    }
    console.log(`${seedUsers.length} users inserted.`)

     // Loop through the imported blogs array and create a row for each blog
    for (let blog of seedBlogs) {
      await Blog.create(blog)
    }
    console.log(`${seedBlogs.length} blogs inserted.`)

    console.log('Database seeding completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error(`Error seeding the database:`, error)
    process.exit(1)
  }
}

seedDatabase()