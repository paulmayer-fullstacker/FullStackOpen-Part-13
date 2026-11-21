// seedingBlogData.js:
// Data used to seed the Db Blogs table.

const seedBlogs = [
     {
    author: 'Dave Allen',
    url: 'https://daveallen.org/',
    title: 'A man walks into a bar ...',
    likes: 5,
    // Valid year (>= 1991 and <= current year) aligned with Exercise 19 validation.
    year: 2022
  },
  {
    author: 'John Smith',
    url: 'https://johnsmith.org/',
    title: 'All about John Smith and his coding',
    likes: 10,
    year: 2023
  },
  {
    author: 'Graham Green',
    url: 'https://grahamgreen.org/',
    title: 'The Power and the Glory',
    likes: 20,
    year: 2024
  }
]

module.exports = seedBlogs