// controllers/authors.js:
// Route handlers for author-based summary statistics endpoints.

// Import Router from Express to handle modular routing for author endpoints.
const router = require('express').Router()
// Import the Blog model from our centralised models directory (models/index.js).
const { Blog } = require('../models')
// Import the active sequelize instance from our database utility. 
// Required to construct SQL Db functions (sequelize.fn) and column references (sequelize.col).
const { sequelize } = require('../utils/db')

// API Route: GET /api/authors
// Returns the number of blogs and total likes for each author, aggregated directly at the database level and ordered by likes descending.
router.get('/', async (req, res) => {
  // Use Sequelize's findAll method to execute an aggregated SQL SELECT query.
  const authors = await Blog.findAll({
    // The attributes option defines which columns and calculated values should be selected in the SQL query.
    attributes: [
      // Select the 'author' column.
      'author',
      // Use sequelize.fn to run the SQL COUNT() function on the 'id' column.
      // Alias the resulting count column as 'blogs' to match the required API format.
      [sequelize.fn('COUNT', sequelize.col('id')), 'blogs'],
      // Use sequelize.fn to run the SQL SUM() function on the 'likes' column. Alias the result: 'likes'.
      [sequelize.fn('SUM', sequelize.col('likes')), 'likes']
    ],
    // Group the aggregated rows by the 'author' column (translates to SQL: GROUP BY "author").
    group: ['author'],
    // Order the final aggregated data set directly within the database query.
    order: [
      // Sort by the calculated SUM of likes in descending (DESC) order. Authors with highest total likes at top of the array.
      [sequelize.fn('SUM', sequelize.col('likes')), 'DESC']
    ]
  })
  // Send the resulting array of author statistics back to the client as a JSON response.
  res.json(authors)
})

// Export the router module so it can be mounted in index.js under /api/authors.
module.exports = router