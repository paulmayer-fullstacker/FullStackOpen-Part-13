// controllers/readingLists.js
// Route handlers for /api/readinglists endpoints.

const router = require('express').Router()
// Import ReadingList, User, and Blog models from the centralised models index.
const { ReadingList, User, Blog } = require('../models')

// API Route: POST /api/readinglists POST a new reading list entry object to the Db Readinglist join table.
// Adds a blog (blogId) to a user's (userId) reading list in the unread state (read: false).
router.post('/', async (req, res, next) => {
  try {
    // Extract userId and blogId from the JSON request body
    const { userId, blogId } = req.body

    // Guard clause: ensure both userId and blogId were provided in the request body
    if (!userId || !blogId) {
      return res.status(400).json({
        error: 'Both userId and blogId are required'
      })
    }

    // Confirm that the referenced User and Blog exist in the database
    // before inserting into reading_lists (gives clear, explicit feedback for invalid IDs).
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        error: `User with id ${userId} not found`
      })
    }
    const blog = await Blog.findByPk(blogId)
    if (!blog) {
      return res.status(404).json({
        error: `Blog with id ${blogId} not found`
      })
    }

    // Create the reading list entry.
    const readingListEntry = await ReadingList.create({
      userId,
      blogId,
      // read: false  // read defaults to false (unread), as defined in the migration and ReadingList model.
    })

    // Respond with HTTP 201 Created and the newly created join table record
    res.status(201).json(readingListEntry)
  }
  // catch unforseen errors
  catch (error) {
    // Forward any unexpected database or validation errors to errorHandler
    next(error)
  }
})
// Export the Express router instance created here. 
module.exports = router
// Consumer by index.js via const readingListsRouter = require('./controllers/readingLists')