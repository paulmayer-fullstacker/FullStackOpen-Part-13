// seed.js:
// Chapter-4 Seeding. Script to reset rows and seed initial user and blog data
// while preserving migration-managed schema via umzug / connectToDb.

require('dotenv').config()
const bcrypt = require('bcrypt')
// Import connectToDb (which runs umzug migrations) instead of relying on sequelize.sync({ force: true })
const { connectToDb } = require('./utils/db')
// Import ReadingList alongside User and Blog so join rows can also be cleared cleanly
const { User, Blog, ReadingList } = require('./models')
const seedUsers = require('./utils/seedingUserData')  // Import our seeding users data object (array).
const seedBlogs = require('./utils/seedingBlogData') // Import our seeding blogs data object (array).

const seedDatabase = async () => {
  try {
    // Connect to Db and ensure all umzug migrations are applied before seeding
    await connectToDb()
    console.log('Connected to Db and verified migrations, ready for seeding.')

    // Replaced sequelize.sync({ force: true }) with row deletion so table schemas
    // and the 'migrations' tracking table remain controlled strictly by umzug migrations.
    await ReadingList.destroy({ where: {} })
    await Blog.destroy({ where: {} })
    await User.destroy({ where: {} })
    console.log('Existing reading_lists, blogs, and users records cleared.')

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