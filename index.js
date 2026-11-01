require('dotenv').config()
const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate()
    console.log('connected to the database successfully!')
  } catch (err) {
    console.error('failed to connect to the database', err)
    return process.exit(1)
  }

  return null
}

connectToDatabase()