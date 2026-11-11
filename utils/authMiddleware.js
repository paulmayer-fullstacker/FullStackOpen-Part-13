// utils/authMiddleware.js
// Centralised authentication and token verification middleware.

// Import the jsonwebtoken library to handle token decoding and cryptographic signature verification.
const jwt = require('jsonwebtoken')
// Import our application's secret key from the configuration utility to validate tokens.
const { SECRET } = require('./config')
// Define the tokenExtractor middleware function, taking Express req, res, and next parameters.
const tokenExtractor = (req, res, next) => {
  // Retrieve the 'authorization' header from the incoming HTTP request.
  const authorisation = req.get('authorization')
  // if the authorization header exists and starts with the 'Bearer ' scheme (case-insensitive).
  if (authorisation && authorisation.toLowerCase().startsWith('bearer ')) {
    try {
      // Extract the token string by removing 'Bearer ' (first 7 chars), verify it using SECRET key, then attach the decoded payload to req.decodedToken.
      req.decodedToken = jwt.verify(authorisation.substring(7), SECRET)
    } 
    // If the token is expired, currupt or invalid, catch the error:
    catch (error) {
      // Log the detailed system error to the server terminal for debugging (e.g., "TokenExpiredError: jwt expired").
      console.error('Token verification failed:', error.message)
      // Return an HTTP 401 Unauthorszed and error msg.
      return res.status(401).json({ error: 'token invalid' })
    }
  } else {
    // else if authorisation header missing or not starting with 'Bearer ', return an HTTP 401 Unauthorized and error msg.
    return res.status(401).json({ error: 'token missing' })
  }
  // If validation passes, hand control over to the next middleware or route handler in the pipeline.
  next()
}
// Export the middleware function wrapped in an object so it can be imported where needed.
module.exports = { tokenExtractor }