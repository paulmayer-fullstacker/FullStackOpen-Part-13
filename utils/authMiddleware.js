// utils/authMiddleware.js
// Centralised authentication: token/session verification and account status middleware.

// Import the jsonwebtoken library to handle token decoding and cryptographic signature verification.
const jwt = require('jsonwebtoken')
// Import our application's secret key from the configuration utility to validate tokens.
const { SECRET } = require('./config')
// Import Session and User models to verify active sessions, and ensure user acc. not disabled.
const { Session, User } = require('../models')

// Define the tokenExtractor middleware function, taking Express req, res, and next parameters.
// Now async so it can also query PostgreSQL for session and user status.
const tokenExtractor = async (req, res, next) => {
  // Retrieve the 'authorization' header from the incoming HTTP request.
  const authorisation = req.get('authorization')
  // if the authorization header exists and starts with the 'Bearer ' scheme (case-insensitive).
  if (authorisation && authorisation.toLowerCase().startsWith('bearer ')) {
    // Strip the 7-character 'Bearer ' prefix so we have the raw JWT string needed for
    // signature verification, database session lookup, and revoking the session on logout.
    const token = authorisation.substring(7)
    // Declare decodedToken outside the try block so it remains in scope after jwt.verify succeeds.
    let decodedToken
    try {
      // Cryptographically verify the JWT signature and decode its payload (e.g., { username, id }).
      decodedToken = jwt.verify(token, SECRET)
    }
    // catch error if token signature is invalid, malformed, or expired:
    catch (error) {
      // Log error msg,
      console.error('Token verification failed:', error.message)
      // and return 401 (Unauthorised) with informative json object.
      return res.status(401).json({ error: 'token invalid' })
    }

    try {
      // Confirm that an active session for this token and user exists in the 'sessions' table (fails after DELETE /api/logout).
      // Query the 'Sessions' table (await) for a matching token + userId pair. Even if the JWT itself is
      // still valid, deleting the session on logout (DELETE /api/logout) removes this session row.
      const session = await Session.findOne({
        where: {
          token,
          userId: decodedToken.id
        }
      })
      // Guard clause: If no matching session row exists (the token has been logged out/revoked),
      if (!session) {
        // return 401 (Unauthorised) with informative json object.
        return res.status(401).json({ error: 'session invalid' })
      }

      // Look up the user by PK (id from decoded token) from User table (await), so we can check current account state.
      const user = await User.findByPk(decodedToken.id)
      // Guard clause: If no user found with that id,
      if (!user) {
        // return 401 (Unauthorised) with informative json object.
        return res.status(401).json({ error: 'user not found' })
      }
      // Guard clause: If user account disabled,
      if (user.disabled) {
        // return 403 (Forbidden) with informative json object.
        return res.status(403).json({ error: 'account disabled' })
      }

      // Attach verified payload, raw token, and user/session info for downstream route handlers.
      req.decodedToken = decodedToken
      req.token = token
      req.user = user
    } catch (error) {
      // Forward unexpected database/Sequelize errors (e.g., connection loss), to centralised error handler.
      return next(error)
    }
    
  }
  // else if authorisation header missing or not starting with 'Bearer ',
  else {
    // return an HTTP 401 (Unauthorized), with informative json object.
    return res.status(401).json({ error: 'token missing' })
  }
  // If validation passes, hand control over to the next middleware or route handler in the pipeline.
  next()
}
// Export the middleware function wrapped in an object so it can be imported where needed.
module.exports = { tokenExtractor }