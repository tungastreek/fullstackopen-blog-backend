const BlogModel = require('../models/blog');
const Joi = require('joi');
const { ValidationError } = Joi;

const blogCreateSchema = Joi.object({
  title: Joi.string().min(5).required(),
  author: Joi.string().required(),
  url: Joi.string().required(),
  likes: Joi.number().default(0),
});

const blogsRouter = require('express').Router();

blogsRouter.get('/', async (req, res) => {
  const blogs = await BlogModel.find({});
  res.json(blogs);
});

blogsRouter.post('/', async (req, res) => {
  const { error } = blogCreateSchema.validate(req.body);
  if (error) {
    throw new ValidationError(error.message);
  }
  const newBlog = new BlogModel(req.body);
  const savedBlog = await newBlog.save();
  res.status(201).json(savedBlog);
});

module.exports = blogsRouter;
