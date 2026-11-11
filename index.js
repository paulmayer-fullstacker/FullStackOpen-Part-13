// index.js:
// Main entry point for the Express backend application.

const express = require('express')
const app = express()

// Import PORT from our centralised config utility.
const { PORT } = require('./utils/config')
// Import our custom Db connection utility.
const { connectToDatabase } = require('./utils/db')
// Import syncModels from our models directory.
const { syncModels } = require('./models')

// Import our modularised blog and user routers.
const blogsRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login') // Import login router.
// Import our centralised error handling middleware
const { errorHandler } = require('./utils/errorMiddleware')

// Middleware to parse incoming JSON payloads in request bodies (e.g., req.body).
app.use(express.json())
// Mount the routers onto their respective route prefixes.
app.use('/api/blogs', blogsRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter) // Mount login router.
// Register error handler last (after all routes have been defined) so it can intercept any errors passed down the pipeline.
app.use(errorHandler)

// Asynchronous startup function ensures Db connection succeeds before starting the server.
const start = async () => {
  // Establish the Db connection first.
  await connectToDatabase()
  // then, synchronise models with the database (applying any schema changes with { alter: true }).
  await syncModels()
  // finally, start the Express server once the Db is successfully connected and synchronised.
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
// Boot the application startup process.
start()