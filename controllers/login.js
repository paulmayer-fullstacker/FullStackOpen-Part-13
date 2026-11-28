// controllers/login.js
// Handles user authentication and JSON Web Token (JWT) generation.
// Also disabled-account enforcement, and server-side session creation.

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const router = require('express').Router()
const { User, Session } = require('../models') // Import User and Session from central models directory.
const { SECRET } = require('../utils/config')

// API Route: POST request to /api/login to authenticate users and issue a token.
router.post('/', async (req, res, next) => {
  try {
    // Destructure username and password from the incoming request body.
    const { username, password } = req.body

    // Query the database using the User model to find a single user matching the provided username.
    // Use User.unscoped() so passwordHash is included in this query, since User's defaultScope excludes passwordHash for normal queries/responses.
    const user = await User.unscoped().findOne({
      // SELECT "id", "username", "name", "password_hash", "disabled", "created_at", "updated_at" FROM "users" AS "user" WHERE "user"."username" = 'the_username_passed_in' LIMIT 1;
      where: { username: username }
    })

    // If user is null:
    const passwordCorrect = user === null
      // set passwordCorrect to false.
      ? false
      // else: use bcrypt to asynchronously compare the plain-text password provided with the hashed password stored in the Db.
      : await bcrypt.compare(password, user.passwordHash)

    // Guard Clause: If either the user does not exist or the password comparison failed, 
    if (!(user && passwordCorrect)) {
      // return an HTTP 401 (Unauthorized) status code with a descriptive JSON error object.
      return res.status(401).json({
        // with a descriptive JSON error object. 
        error: 'invalid username or password'
        // Note: Wrong credentials is not a system error, it is normal operational authorisation failure.
      })
    }

    // Guard Clause: if user is disabled, (Prevent from logging in and receiving a new token/session.)
    if (user.disabled) {
      // return an HTTP 401 (Unauthorized) status code,
      return res.status(401).json({
        // with a descriptive JSON error object. 
        error: 'account disabled'
      })
    }
    // Guard clauses pass:
    // Create a plain JavaScript object payload containing the identifying information we want to embed and encode inside the JSON Web Token.
    const userForToken = {
      username: user.username,
      id: user.id,
    }

    // Sign the token using the jsonwebtoken library, combining our user payload with our application's secret key (SECRET) from utils/config.
    const token = jwt.sign(userForToken, SECRET)

    // Persist an active session row in the 'sessions' table on login
    // so subsequent requests can verify the session exists and logout can delete/revoke it.
    await Session.create({
      userId: user.id,
      token
    })

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