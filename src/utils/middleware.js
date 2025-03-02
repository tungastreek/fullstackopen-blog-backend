const logger = require('./logger');

const unknownEndpoint = (req, res) => {
  res.status(404).end();
};

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformed id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: `Validation error ${err.message}` });
  }

  next(err);
};

const shouldSkipLog = () => process.env.NODE_ENV === 'test';

module.exports = { unknownEndpoint, errorHandler, shouldSkipLog };
