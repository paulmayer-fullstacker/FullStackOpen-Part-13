// util/db.js:
// Manage Db connection, supporting conditional 'test' Db switching.

const { Sequelize } = require('sequelize')
// Import the DATABASE_URL from our centralised config file.
const { DATABASE_URL, TEST_DATABASE_URL } = require('./config')

// Conditional database URL selection
// If: TESTING env var 'true',
const dbUrl = process.env.TESTING === 'true'
//  use TEST_DATABASE_URL. 
? TEST_DATABASE_URL
// else: use DATABASE_URL
: DATABASE_URL

// Initialise Sequelize with the Db connection URL.
const sequelize = new Sequelize(dbUrl)
// Define async function to test the database connection.
const connectToDb = async () => {
  // Use a try/catch block to handle any connection errors.
  try {
    // Ask Sequelize to test the connection to the database (authenticate), and await response.
    await sequelize.authenticate()
    // If authenticated, query Db directly for confirmation of current Db name.
    const [results] = await sequelize.query('SELECT current_database();')
    const confirmedDbName = results[0].current_database
    // and log success message with Db name.
    console.log(`Successfully connected to: ${confirmedDbName}`)
  } catch (err) {
    // else: log error message with err object message for debugging.
    console.log('Database connection failed', err.message)
    // and terminate the Node.js application with failure code '1'
    return process.exit(1)
  }
}
// Export the connection function and the sequelize instance for other modules to use.
module.exports = { connectToDb, sequelize }