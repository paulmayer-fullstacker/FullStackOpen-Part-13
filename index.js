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

// Import our modularised blog, user, login, author, readingLists and logout routers.
const blogsRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login') // Import login router.
const authorsRouter = require('./controllers/authors')  // Import our authors router.
const readingListsRouter = require('./controllers/readingLists')  // Import our reading list router.
const logoutRouter = require('./controllers/logout') // Import logout router to handle DELETE /api/logout requests.
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
app.use('/api/logout', logoutRouter) // Mount the logout router under /api/logout.
// Mount/register error handler last (after all routes have been defined) so it can intercept any errors passed down the pipeline.
app.use(errorHandler)

// Asynchronous startup function ensures Db connection succeeds before starting the server.
const start = async () => {
  // Establish the Db connection first.
  await connectToDb()
  // Start the Express server once the Db is successfully connected and migrated.
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}
// Boot the application startup process.
start()

// ============================================================================
// psql Quick Reference (Database Reset, Schema Inspection & Exercise-25 Testing)
// ============================================================================

// 1. Connect to PostgreSQL:
//    psql postgres://postgres:root@localhost:5432/blog_db

// 2. Full Clean Reset (drops all tables + migration history so Umzug rebuilds from scratch):
//    DROP TABLE IF EXISTS sessions CASCADE;
//    DROP TABLE IF EXISTS reading_lists CASCADE;
//    DROP TABLE IF EXISTS blogs CASCADE;
//    DROP TABLE IF EXISTS users CASCADE;
//    DROP TABLE IF EXISTS migrations CASCADE;
//    \q
//    (Then run `npm start` in another terminal to re-run all migrations)

// 3. Verify Migrations & Table Schemas:
//    \dt                         -- List all tables (users, blogs, reading_lists, sessions, migrations)
//    SELECT * FROM migrations;   -- Confirm all 5 migration files have been executed
//    \d users                    -- Check columns (including 'disabled' boolean)
//    \d blogs                    -- Check columns (including 'year' and 'user_id' FK)
//    \d reading_lists            -- Check join table columns ('user_id', 'blog_id', 'read')
//    \d sessions                 -- Check active sessions columns ('id', 'user_id', 'token', timestamps)

// 4. Inspect & Test Exercise-25 Sessions / Disabled Users:
//    SELECT id, username, disabled FROM users;
//    SELECT id, user_id, LEFT(token, 25) AS token_preview, created_at FROM sessions;
//    UPDATE users SET disabled = true WHERE username = 'user@example.com';   -- Disable account
//    UPDATE users SET disabled = false WHERE username = 'user@example.com';  -- Re-enable account
//    \q