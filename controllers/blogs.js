// controllers/blogs.js
// Route handlers for db_blog API endpoints.

const router = require('express').Router()
// Import the Blog model from our centralised models directory.
const { Blog } = require('../models')

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

// API Route: POST a new blog object to the Db.
router.post('/', async (req, res, next) => {
  try {
    // Insert new row in the table using the JSON data sent by the client (req.body). 'await' the Db operation to finish.
    const blog = await Blog.create(req.body)
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

// API Route: DELETE a blog by id, using the blogFinder middleware.
router.delete('/:id', blogFinder, async (req, res) => {
  // Since blogFinder already verified and attached req.blog, destroy directly without validation.
  await req.blog.destroy()
  // and send 204 (No Content) status on successful deletion.
  res.status(204).end()
})

module.exports = router