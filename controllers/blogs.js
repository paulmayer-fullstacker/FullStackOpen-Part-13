// controllers/blogs.js
// Route handlers for db_blog API endpoints.

const router = require('express').Router()
// Import the Blog and User models from our centralised models directory.
const { Blog, User } = require('../models')
// Import our custom token extractor middleware for authentication.
const { tokenExtractor } = require('../utils/authMiddleware')

// Custom middleware to find a blog by its primary key (id) and reduce code repetition.
const blogFinder = async (req, res, next) => {
  // Find the blog and attach it to the request object (req.blog)
  req.blog = await Blog.findByPk(req.params.id)
  // Guard clause
  if (!req.blog) {
    // If no blog found with this id, return 404 (Not Found)
    return res.status(404).json({ error: 'Blog not found' })
  }
  // else, if all guard clauses pass, proceed to the next stage (route handler functions).
  next() 
}

// API Route: GET all blog objects from the Db using the Sequelize Blog model.
router.get('/', async (req, res) => {
  // Blog.findAll() translates to SQL: SELECT * FROM blogs.
  const blogs = await Blog.findAll()
  res.json(blogs)
})

// API Route: POST a new blog object to the Db. Protected by tokenExtractor middleware.
router.post('/', tokenExtractor, async (req, res, next) => {
  try {
    // Find the user in the Db using the user id extracted and decoded from the JWT token (req.decodedToken.id).
    const user = await User.findByPk(req.decodedToken.id)
    // Create a new blog row in the Db,
    const blog = await Blog.create({
      // spreading the client's request body properties 
      ...req.body,
      // and explicitly linking it to the authenticated user via the foreign key (userId).
      userId: user.id
    })
    // If success: send an HTTP 201 (Created) code back to client, with newly created blog object (as JSON), inc. its new Db id.
    res.status(201).json(blog)
    // else: catch error. Problem, e.g., missing a required field like 'url'.
  } catch (error) {
    // Passes the error to our centralised error handler in middleware.js.
    next(error) 
  }
})

// API Route: PUT a new likes value onto a blog by id, using the blogFinder middleware.
router.put('/:id', blogFinder, async (req, res, next) => {
  try {
    // Update the likes property on the blog object found by blogFinder.
    req.blog.likes = req.body.likes
    // Save the updated blog instance back to the PostgreSQL Db.
    await req.blog.save()
    // Send the updated blog object back to the client as JSON.
    res.json(req.blog)
    // Handle any validation or Db errors (invalid entry for new likes, or PUT conection failure ).
  } catch (error) {
    // Passes the error to our centralised error handler in middleware.js.
    next(error) 
  }
})

// // API Route: DELETE a blog by id, using tokenExtractor and blogFinder middleware.
// router.delete('/:id', tokenExtractor, blogFinder, async (req, res, next) => {
//   try {
//     // Guard clause:
//     // req.blog.userId is the foreign key stored in the database, req.decodedToken.id is the id extracted from the verified JWT.
//     if (req.blog.userId !== req.decodedToken.id) {
//       // if current user is not the owner of the blog return 403 (Forbidden) and error msg.
//       return res.status(403).json({ 
//         error: 'Unauthorized: Only the owner of a blog can delete it' 
//       })
//     }
//     // else if ownership check passes, destroy the blog instance.
//     await req.blog.destroy()
//     // and send an HTTP 204 (No Content) status on successful deletion.
//     res.status(204).end()

//   } catch (error) {
//     // Pass any unexpected errors to the centralised error handler.
//     next(error)
//   }
// })

// API Route: DELETE a blog by id, using the blogFinder middleware.
router.delete('/:id', blogFinder, async (req, res) => {
  // Since blogFinder already verified and attached req.blog, destroy directly without validation.
  await req.blog.destroy()
  // and send 204 (No Content) status on successful deletion.
  res.status(204).end()
})

module.exports = router