// util/db.js:
// Manage Db connection, supporting conditional 'test' Db switching.

const fs = require('fs')
const path = require('path')
const { Sequelize } = require('sequelize')
// Import the DATABASE_URL from our centralised config file.
const { DATABASE_URL, TEST_DATABASE_URL } = require('./config')
// Import Umzug and SequelizeStorage for migration management.
const { Umzug, SequelizeStorage } = require('umzug')

// Conditional database URL selection
// If: TESTING env var 'true',
const dbUrl = process.env.TESTING === 'true'
//  use TEST_DATABASE_URL. 
? TEST_DATABASE_URL
// else: use DATABASE_URL
: DATABASE_URL

// Initialise Sequelize with the Db connection URL.
const sequelize = new Sequelize(dbUrl)

// Define an asyn function to handle database migrations using Umzug.
const runMigrations = async () => {
  
  const migrationsPath = path.join(__dirname, '../migrations')
  
  // Read directory files manually
  const migrationFiles = fs.readdirSync(migrationsPath).filter(file => file.endsWith('.js'))
  console.log('Current __dirname:', __dirname);
  console.log('Resolved migration path target:', path.resolve(__dirname, '../migrations'));

  // Create new instance of Umzug (migration management tool).
  const migrator = new Umzug({
    // Configur where to find migration files
    migrations: {
      // Use 'glob' pattern to look for all JS files inside the top level 'migrations' directory.
      glob: 'migrations/*.js',
    },
    // Umzug Configuration:
    // SequelizeStorage creates a tracking table in our database to record completed migrations.
    storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
    // Pass Sequelize's queryInterface as the context object to the migration files.
    // This gives migrations the power to execute database changes (i.e., createTable, addColumn).
    context: sequelize.getQueryInterface(),
    // Tell Umzug to print its progress, logs, and any errors directly to the console
    logger: console,
  })
  
  // Execute all pending (un-run) migrations and wait for the operation to complete.
  // .up() returns an array of migration objects that were just successfully executed in this batch.
  const migrations = await migrator.up()
  // Print confirmation message to console with migration status, passing an object with extra details as the second argument.
  console.log('Migrations up to date', {
    // map() through the executed migrations array to extract the filename (mig.name), transforming an array of objects into an array of strings (e.g., ['20261117_00_initialize_users_and_blogs.js']).
    files: migrations.map((mig) => mig.name),
    // o/p: Migrations up to date { files: [ '20261117_00_initialize_users_and_blogs.js' ] }
  })
}

// Define async function to test the database connection.
const connectToDb = async () => {
  // Use a try/catch block to handle any connection errors.
  try {
    // Ask Sequelize to test the connection to the database (authenticate), and await response.
    await sequelize.authenticate()
    // Run migrations immediately after authentication completed.
    await runMigrations()
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