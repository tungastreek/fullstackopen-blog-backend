const Joi = require('joi');

const BlogModel = require('../models/blog');
const { authenticate, validateWith } = require('../utils/middleware');
const UserModel = require('../models/user');

const blogCreateSchema = Joi.object({
  title: Joi.string().min(5).required(),
  author: Joi.string().required(),
  url: Joi.string().required(),
  likes: Joi.number().default(0),
});

const blogUpdateSchema = Joi.object({
  title: Joi.string().min(5).required(),
  author: Joi.string().required(),
  url: Joi.string().required(),
  likes: Joi.number().default(0),
});

const blogsRouter = require('express').Router();

blogsRouter.get('/', async (req, res) => {
  const blogs = await BlogModel.find({}).populate('user', { username: 1, name: 1 });
  res.json(blogs);
});

blogsRouter.post('/', authenticate, validateWith(blogCreateSchema), async (req, res) => {
  const newBlog = new BlogModel(req.body);
  const userId = req.authPayload.id;
  newBlog.user = userId;
  const savedBlog = await newBlog.save();

  const user = await UserModel.findById(userId);
  user.blogs = user.blogs.concat(savedBlog.id);
  user.save();
  res.status(201).json(savedBlog);
});

blogsRouter.put('/:id', validateWith(blogUpdateSchema), async (req, res) => {
  const updatedBlog = await BlogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedBlog) {
    res.status(404).end();
  }
  res.json(updatedBlog);
});

blogsRouter.delete('/:id', async (req, res) => {
  const blog = await BlogModel.findByIdAndDelete(req.params.id);
  if (!blog) {
    res.status(404).end();
  }
  res.status(204).end();
});

module.exports = blogsRouter;
