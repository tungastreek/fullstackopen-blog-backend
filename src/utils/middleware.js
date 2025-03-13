const logger = require('./logger');
const CustomError = require('./custom-error');

const validateWith = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    throw new CustomError(error.message, 'ValidationError');
  }
  next();
};

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

  if (err.name === 'MongoServerError' && err.message && err.message.includes('E11000')) {
    return res.status(400).json({ error: `Duplicate resource: ${err.message}` });
  }

  next(err);
};

const shouldSkipLog = () => process.env.NODE_ENV === 'test';

module.exports = { validateWith, unknownEndpoint, errorHandler, shouldSkipLog };
