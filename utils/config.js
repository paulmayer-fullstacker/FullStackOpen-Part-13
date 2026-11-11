// utils/config.js:
// centralise management of configuration settings and environment variables, for use by other modules.

// Load the dotenv library and run .config().
// .config() reads the local .env file and injects those variables into Node.js's global process.env object.
require('dotenv').config()
// Export this object, to make it available for other modules.
module.exports = {
  // PostgreSQL database connection string.
  DATABASE_URL: process.env.DATABASE_URL,
  // Custom PORT from env var or fallback (3001).
  PORT: process.env.PORT || 3001,
  // Export our secret key for signing JWTs.
  SECRET: process.env.SECRET,
}