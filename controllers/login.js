// controllers/login.js
// Handles user authentication and JSON Web Token (JWT) generation.

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const { User } = require('../models')
const { SECRET } = require('../utils/config')

// API Route: POST request to /api/login to authenticate users and issue a token.
router.post('/', async (req, res, next) => {
  try {
    // Destructure username and password from the incoming request body.
    const { username, password } = req.body

    // Query the database using the User model to find a single user matching the provided username.
    const user = await User.findOne({
      // SELECT "id", "username", "name", "created_at", "updated_at" FROM "users" AS "user" WHERE "user"."username" = 'the_username_passed_in' LIMIT 1;
      where: { username: username }
    })

    // If user is null:
    const passwordCorrect = user === null
      // set passwordCorrect to false.
      ? false
      // else: use bcrypt to asynchronously compare the plain-text password provided with the hashed password stored in the Db.
      : await bcrypt.compare(password, user.passwordHash)

    // If either the user does not exist or the password comparison failed, 
    if (!(user && passwordCorrect)) {
      // return an HTTP 401 (Unauthorized) status code with a descriptive JSON error object.
      return res.status(401).json({
        // with a descriptive JSON error object. 
        error: 'invalid username or password'
        // Note: Wrong credentials is not a system error, it is normal operational authorisation failure.
      })
    }

    // Create a plain JavaScript object payload containing the identifying information we want to embed and encode inside the JSON Web Token.
    const userForToken = {
      username: user.username,
      id: user.id,
    }

    // Sign the token using the jsonwebtoken library, combining our user payload with our application's secret key (SECRET) from utils/config.
    const token = jwt.sign(userForToken, SECRET)

    // Send an HTTP 200 (OK) response containing the generated token, username, and real name back to the client.
    res.status(200).send({
      token,
      username: user.username,
      name: user.name
    })

  }
  // Catch any unexpected database or system errors (i.e., database connection failure during User.findOne),
  catch (error) {
    // and pass them down the pipeline to our centralised error handler in utils/middleware.js.
    next(error)
  }
})

// Export the router module so it can be mounted onto /api/login in index.js.
module.exports = router