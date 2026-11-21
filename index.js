// index.js:
// Main entry point for the Express backend application.

const express = require('express')
const app = express()

// Import PORT from our centralised config utility.
const { PORT } = require('./utils/config')
// Import our custom Db connection utility.
const { connectToDb } = require('./utils/db')
// Import Blog and User from our models directory. syncModels removed.
const { Blog, User } = require('./models')  // Blog and User for test routes.

// Import our modularised blog, user, login and author routers.
const blogsRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login') // Import login router.
const authorsRouter = require('./controllers/authors')  // Import our authors router.
const readingListsRouter = require('./controllers/readingLists')  // Import our reading list router.
// Import our centralised error handling middleware
const { errorHandler } = require('./utils/errorMiddleware')

// Mount middleware to parse incoming JSON payloads in request bodies (e.g., req.body).
app.use(express.json())

// API Route: GET status as health check endpoint.
app.get('/', (req, res) => {
  // Responds with HTTP 200 to confirm (if) the backend is running.
  res.status(200).send('OK')
})

// API Route: POST (as an Action Trigger), a cmd to the Db, not data. 
// Db reset endpoint: Empties both database tables so automated tests start clean
app.post('/api/reset', async (req, res) => {
  // Truncate tables with cascade: true to cleanly handle foreign key constraints (blogs referencing users).
  await Blog.destroy({ truncate: { cascade: true } })
  await User.destroy({ truncate: { cascade: true } })
  // Return HTTP 204 (No Content) on successful reset
  res.status(204).end()
})

// Mount the routers onto their respective route prefixes.
app.use('/api/blogs', blogsRouter) // Mount the blogs router under /api/blogs.
app.use('/api/users', userRouter)  // Mount users router under /api/users.
app.use('/api/login', loginRouter) // Mount the login router.
app.use('/api/authors', authorsRouter)  // Mount the authors router.
app.use('/api/readinglists', readingListsRouter) // Mount the reading list router.
// Mount/register error handler last (after all routes have been defined) so it can intercept any errors passed down the pipeline.
app.use(errorHandler)

// Asynchronous startup function ensures Db connection succeeds before starting the server.
const start = async () => {
  // Establish the Db connection first.
  await connectToDb()
  // // NOTE: await syncModels() removed as migrations now handle database table creation and schema updates on startup.
  // // then, synchronise models with the database (applying any schema changes with { alter: true }).
  // await syncModels()
  // Start the Express server once the Db is successfully connected and migrated.
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
// Boot the application startup process.
start()

// Terminal 1:
// psql postgres://postgres:root@localhost:5432/blog_db
// DROP TABLE IF EXISTS blogs CASCADE;
// DROP TABLE IF EXISTS users CASCADE;
// DROP TABLE IF EXISTS migrations CASCADE;

// Terminal 2:
// npm start

// Terminal 1:
// _db# \d
// Display tables
// \d users
// \d blogs
// _db# \q