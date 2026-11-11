// seed.js:
// Script to reset and seed the Db with initial blog and user data.

require('dotenv').config()
const bcrypt = require('bcrypt')
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

    // Seed Users first and store the seeded user instances so we can reference their ids when seeding blogs.
    const seededUsers = []
    // Loop through the imported users array, 
    for (let user of seedUsers) {
      // Hash the plaintext password before creating the user model instance
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(user.password, saltRounds)
      // Create a row for each user, using passwordHash.
      const savedUser = await User.create({
        username: user.username,
        name: user.name,
        passwordHash
      })
      // Then add the user to our seededUsers array.
      seededUsers.push(savedUser)
    }
    console.log(`${seededUsers.length} users inserted.`)

    // if no users seeded: Ensure we have at least one user before seeding blogs.
    if (seededUsers.length === 0) {
      // throw error and msg.
      throw new Error('Cannot seed blogs: No users available.')
    }

     // Loop through the imported blogs array
    for (let blog of seedBlogs) {
      // and create a row for each blog.
      await Blog.create({
        // spread: takes all blog key-value properties and unpacks them. Append seededUser id and create new blog entry.
        ...blog,
        // Assign blogs to users. Here, assign all seed blogs to the first user (seededUsers[0].id).
        userId: seededUsers[0].id // Link the blog to the first seeded user
      })
    }
    console.log(`${seedBlogs.length} blogs inserted and linked to user id ${seededUsers[0].id}.`)

    console.log('Database seeding completed successfully!')
    process.exit(0)
  } 
  catch (error) {
    console.error(`Error seeding the database:`, error)
    process.exit(1)
  }
}

seedDatabase()