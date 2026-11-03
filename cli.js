// cli.js:
 
require('dotenv').config()
const { Sequelize, QueryTypes } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

const main = async () => {
  try {
    // Fetch all blogs from the database
    const blogs = await sequelize.query('SELECT * FROM blogs', { type: QueryTypes.SELECT })
    
    // Loop through and print each blog in the requested format
    blogs.forEach(blog => {
      console.log(`${blog.author}: '${blog.title}', ${blog.likes} likes`)
    })
    
    // Close the database connection when finished
    await sequelize.close()
  } catch (error) {
    console.error('Error connecting to the database:', error)
  }
}

main()