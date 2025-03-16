const Joi = require('joi');

const BlogModel = require('../models/blog');
const { authenticate, validateWith } = require('../utils/middleware');
const UserModel = require('../models/user');
const CustomError = require('../utils/custom-error');

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
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new CustomError('Unauthorized', 'AuthorizationError');
  }
  newBlog.user = user.id;
  const savedBlog = await newBlog.save();

  user.blogs = user.blogs.concat(savedBlog.id);
  user.save();
  res.status(201).json(savedBlog);
});

blogsRouter.put('/:id', authenticate, validateWith(blogUpdateSchema), async (req, res) => {
  const userId = req.authPayload.id;
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new CustomError('Unauthorize', 'AuthorizationError');
  }

  const blog = await BlogModel.findById(req.params.id);
  if (!blog) {
    throw new CustomError('Resource not found', 'NotFoundError');
  }

  if (blog.user.toString() !== user.id.toString()) {
    throw new CustomError('Unauthorized', 'AuthorizationError');
  }

  const updatedBlog = await BlogModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedBlog);
});

blogsRouter.delete('/:id', authenticate, async (req, res) => {
  const userId = req.authPayload.id;
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new CustomError('Unauthorized', 'AuthorizationError');
  }

  const blog = await BlogModel.findById(req.params.id);
  if (!blog) {
    throw new CustomError('Resource not found', 'NotFoundError');
  }

  if (blog.user.toString() !== user.id.toString()) {
    throw new CustomError('Unauthorized', 'AuthorizationError');
  }
  await BlogModel.findByIdAndDelete(req.params.id);

  res.status(204).end();
});

module.exports = blogsRouter;
