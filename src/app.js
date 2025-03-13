const express = require('express');
require('express-async-errors');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const logger = require('./utils/logger');
const config = require('./utils/config');
const middleware = require('./utils/middleware');
const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');

mongoose.set('strictQuery', true);
mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) => {
    logger.error('Cannot connected to MongoDB:', error.message);
    process.exit(1);
  });

const app = express();
app.use(cors());
app.use(express.json());
app.use(
  morgan(
    function (tokens, req, res) {
      return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'),
        '-',
        tokens['response-time'](req, res),
        'ms',
        JSON.stringify(req.body),
      ].join(' ');
    },
    { skip: middleware.shouldSkipLog }
  )
);
app.use('/api/blogs', blogsRouter);
app.use('/api/users', usersRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
