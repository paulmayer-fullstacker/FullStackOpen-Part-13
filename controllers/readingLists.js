// controllers/readingLists.js
// Route handlers for /api/readinglists endpoints.

const router = require('express').Router()
// Import ReadingList, User, and Blog models from the centralised models index.
const { ReadingList, User, Blog } = require('../models')
// Import tokenExtractor middleware to authenticate requests via Bearer token.
const { tokenExtractor } = require('../utils/authMiddleware')

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

// API Route: PUT /api/readinglists/:id PUT a new value in the boolean 'read' field. Authentication required as owner only function.
// Marks a reading list entry as read (or updates its 'read' boolean status) for the authenticated owner.
router.put('/:id', tokenExtractor, async (req, res, next) => {
  try {
    // Look up the reading list entry by its primary key (:id) from the URL params.
    const readingListEntry = await ReadingList.findByPk(req.params.id)

    // Guard clause: if NO reading list entry with given id:
    if (!readingListEntry) {
      // Return 404 (Not Found),
      return res.status(404).json({
        // with suitable error message.
        error: `Reading list entry with id ${req.params.id} not found`
      })
    }

    // Guard clause: Ensure the authenticated user from req.decodedToken owns this entry.
    // Prevents one user from marking another user's reading list item as read.
    // if the logged in user is not the reading list owner:
    if (readingListEntry.userId !== req.decodedToken.id) {
      // Return 403 (Forbidden),
      return res.status(403).json({
        // with suitable error message.
        error: 'Only the owner of this reading list entry can update its read status'
      })
    }

    // Guard clause: Validate that 'read' is explicitly provided as a boolean in the request body.
    // if req.body.read type NOT boolean:
    if (typeof req.body.read !== 'boolean') {
      // Return 400 (Bad Request),
      return res.status(400).json({
        // with suitable error message.
        error: 'The "read" field must be a boolean (true or false)'
      })
    }

    // All guard clauses pass: Update the read flag and persist changes to PostgreSQL.
    readingListEntry.read = req.body.read
    await readingListEntry.save()

    // Return HTTP 200 (OK) with the updated reading list entry.
    res.json(readingListEntry)
  } 
  // Catch unexpected errors (i.e., DB/Sequelize errors),
  catch (error) {
    // and forward them to the centralised errorHandler.
    next(error)
  }
})
// Export the Express router instance created here. 
module.exports = router
// Consumer by index.js via const readingListsRouter = require('./controllers/readingLists')