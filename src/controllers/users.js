const { Router } = require('express');
const Joi = require('joi');

const UserModel = require('../models/user');
const { validateWith } = require('../utils/middleware');
const { generatePasswordHash } = require('../utils/password-utils');

const usersRouter = Router();

const UserCreateSchema = Joi.object({
  username: Joi.string().min(3).required(),
  name: Joi.string().optional(),
  password: Joi.string().min(3).required(),
});

usersRouter.get('/', async (req, res) => {
  const users = await UserModel.find({}).populate('blogs', { title: 1, author: 1, url: 1 });
  res.json(users);
});

usersRouter.post('/', validateWith(UserCreateSchema), async (req, res) => {
  const { body } = req;
  const { username, name, password } = body;

  const passwordHash = await generatePasswordHash(password);

  const newUser = new UserModel({
    username,
    name,
    passwordHash,
  });

  const savedUser = await newUser.save();
  res.status(201).json(savedUser);
});

module.exports = usersRouter;
