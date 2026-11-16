// index.js:
// Main entry point for the Express backend application.

const express = require('express')
const app = express()

// Import PORT from our centralised config utility.
const { PORT } = require('./utils/config')
// Import our custom Db connection utility.
const { connectToDb } = require('./utils/db')
// Import Blog, User and syncModels from our models directory.
const { Blog, User, syncModels } = require('./models')  // Blog and User for test routes.

// Import our modularised blog, user, login and author routers.
const blogsRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login') // Import login router.
const authorsRouter = require('./controllers/authors')  // Import our authors router.
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
// Mount/register error handler last (after all routes have been defined) so it can intercept any errors passed down the pipeline.
app.use(errorHandler)

// Asynchronous startup function ensures Db connection succeeds before starting the server.
const start = async () => {
  // Establish the Db connection first.
  await connectToDb()
  // then, synchronise models with the database (applying any schema changes with { alter: true }).
  await syncModels()
  // finally, start the Express server once the Db is successfully connected and synchronised.
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
// Boot the application startup process.
start()