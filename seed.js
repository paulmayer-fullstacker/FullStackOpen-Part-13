// seed.js:
// Script to reset and seed the database with initial blog data.

require('dotenv').config()
const { sequelize } = require('./utils/db')
const { Blog } = require('./models') // Import Blog from our centralised models entry point.
const seedBlogs = require('./utils/seedingBlogData') // Import our seeding blogs data object (array).

const seedDatabase = async () => {
  try {
    // Authenticate Db connection.
    await sequelize.authenticate()
    console.log('Connected to Db, ready for seeding.')

    // Drop the table if it exists and recreate it (force: true drops existing tables)
    await Blog.sync({ force: true })
    console.log('Database tables dropped and recreated.')

    // Loop through the imported array and create a row for each blog
    for (let blog of seedBlogs) {
      await Blog.create(blog)
    }

    console.log(`Seeding success! ${seedBlogs.length} blogs inserted.`)
    process.exit(0)
  } catch (error) {
    console.error(`Error seeding the database:`, error)
    process.exit(1)
  }
}

seedDatabase()