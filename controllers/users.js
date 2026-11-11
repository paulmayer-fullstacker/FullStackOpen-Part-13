// controllers/users.js
// Route handlers for db_user API endpoints.

const router = require('express').Router()
const bcrypt = require('bcrypt')
// Import the User model from our centralised models directory.
const { User } = require('../models')

// Custom middleware to find a user by their unique username (used for PUT).
const userFindByUsername = async (req, res, next) => {
// req.user = await (SELECT "id", "username", "name", "created_at", "updated_at" 
// FROM "users" AS "user" WHERE "user"."username" = 'the_username_passed_in_url' LIMIT 1;)
  req.user = await User.findOne({ where: { username: req.params.username } })
  if (!req.user) {
    return res.status(404).json({ error: 'User not found' })
  }
  next()
}

// API Route: GET all user objects from the Db using the Sequelize User model.
router.get('/', async (req, res) => {
    // Blog.findAll() translates to SQL: SELECT * FROM users.
  const users = await User.findAll()
  res.json(users)
})

// API Route: POST a new user object to the Db. Hashes plaintext password with bcrypt.
router.post('/', async (req, res, next) => {
  try {
    const { username, name, password } = req.body
    // Generate a secure bcrypt password hash (salt rounds = 10)
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    // Insert new row in the table using the JSON data sent by the client (req.body). 'await' the Db operation to finish.
    const user = await User.create({
      username,
      name,
      passwordHash
    })
    // If success: send an HTTP 201 (Created) code back to client, with newly created user object (as JSON), inc. its new Db id.
    res.status(201).json(user)
    // else: catch error. Problem, e.g., missing a required field like 'user name'.
  } catch(error) {
    // Passes the error to our centralised error handler in middleware.js.
    next(error)
  }
})

// API Route: PUT a new name value onto a user by unique username, using the userFindByUsername middleware.
router.put('/:username', userFindByUsername, async (req, res, next) => {
  try {
    // Update the name property on the user object found by userFindByUsername.
    req.user.name = req.body.name
    // Save the updated user instance back to the PostgreSQL Db.
    await req.user.save()
    // Send the updated user object back to the client as JSON.
    res.json(req.user)
    // Handle any validation or Db errors (invalid entry for new user name, or PUT conection failure ).
  } catch (error) {
    // Passes the error to our centralised error handler in middleware.js.
    next(error) 
  }
})

// API Route: GET a user by id. Simple/single request by id: manage localy, without middleware.
router.get('/:id', async (req, res, next) => {
  try {
    // Query Db for user matching the PK (id) provided in the URL parameters (e.g., /api/users/3 : SELECT * FROM users WHERE id = 3 LIMIT 1;
    const user = await User.findByPk(req.params.id)
    if (user) {
      // if user found, send the user object back to the client as a JSON response.
      res.json(user)
    } else {
      // else: respond with an HTTP 404 (Not Found) status and an error message.
      res.status(404).json({ error: 'User not found' }) // user==null is not a system error, just a user error.
    }
  } 
  // catch unexpected failure or Db connection issue as 'error'.
  catch (error) {
    // and pass the error down the pipeline to our centralised errorHandler middleware in utils/middleware.js.
    next(error)
  }
})

module.exports = router