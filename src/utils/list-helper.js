const _ = require('lodash');
const totalLikes = (blogs) => {
  return blogs.map((blog) => blog.likes).reduce((sum, likes) => sum + likes, 0);
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }
  return [...blogs].sort((b1, b2) => b2.likes - b1.likes)[0];
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  const blogsCountByAuthor = _.countBy(blogs, (blog) => blog.author);
  const topAuthor = _.maxBy(Object.entries(blogsCountByAuthor), ([, count]) => count);

  return { author: topAuthor[0], blogs: topAuthor[1] };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null;
  }

  let likesCountByAuthor = [];
  const blogsByAuthor = _.groupBy(blogs, (blog) => blog.author);
  _.forEach(Object.entries(blogsByAuthor), ([author, blogs]) => {
    likesCountByAuthor = [
      ...likesCountByAuthor,
      [author, blogs.map((b) => b.likes).reduce((total, likes) => total + likes, 0)],
    ];
  });
  const mostLikedAuthor = _.maxBy(likesCountByAuthor, ([, likes]) => likes);

  return { author: mostLikedAuthor[0], likes: mostLikedAuthor[1] };
};

module.exports = { totalLikes, favoriteBlog, mostBlogs, mostLikes };
