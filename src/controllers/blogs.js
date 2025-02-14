const BlogModel = require('../models/blog');

const blogsRouter = require('express').Router();

blogsRouter.get('/', (req, res, next) => {
  BlogModel
    .find({})
    .then(notes => {
      res.json(notes);
    })
    .catch(error => next(error));
});

blogsRouter.post('/', (req, res, next) => {
  const newBlog = new BlogModel(req.body);
  newBlog
    .save()
    .then(savedBlog => res.status(201).json(savedBlog))
    .catch(error => next(error));
});

module.exports = blogsRouter;
