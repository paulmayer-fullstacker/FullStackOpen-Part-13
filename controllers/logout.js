// controllers/logout.js:
// Handle user logout by deleting the active session record associated with the request's token.

// Create an Express Router instance for logout-related endpoints.
const router = require('express').Router()
// Import Session model so we can remove the active session row on logout.
const { Session } = require('../models')
// Import tokenExtractor to authenticate the request, verify the session exists,
// and populate req.token and req.decodedToken before deleting the session.
const { tokenExtractor } = require('../utils/authMiddleware')

// API Route: DELETE /api/logout to terminate/revoke the caller's active session.
router.delete('/', tokenExtractor, async (req, res, next) => {
  try {
    // Delete the Session (await) row from 'sessions'.
    await Session.destroy({
      where: {
        // that matches this token and user ID
        token: req.token,
        userId: req.decodedToken.id
      }
      // Once removed, reusing the same JWT on any protected route will fail the Session.findOne check
    // in tokenExtractor and return 401 Unauthorised.
    })

    // Return HTTP 204 (No Content) to indicate successful logout with no response body required.
    return res.status(204).end()
  } 
  // Catch unexpected database/Sequelize errors (i.e., database connection failure),
  catch (error) {
    // and forward to centralised error handler.
    return next(error)
  }
})

// Export router so it can be mounted at '/api/logout' in index.js.
module.exports = router