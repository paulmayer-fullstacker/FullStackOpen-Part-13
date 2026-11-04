// util/db.js:

require('dotenv').config()
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected to the database')
  } catch (err) {
    console.log('Database connection failed')
    return process.exit(1)
  }
}

module.exports = { connectToDatabase, sequelize }