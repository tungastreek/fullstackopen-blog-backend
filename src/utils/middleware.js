const jwt = require('jsonwebtoken');

const logger = require('./logger');
const CustomError = require('./custom-error');

const authenticate = (req, res, next) => {
  const validationSchema = 'Bearer '.toLowerCase();
  const authorization = req.get('authorization');
  if (!authorization || !authorization.toLowerCase().startsWith(validationSchema)) {
    throw new CustomError('Unauthorized', 'AuthorizationError');
  }

  const token = authorization.substring(validationSchema.length);
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodedToken.id) {
    throw new CustomError('Unauthorized', 'AuthorizationError');
  }

  req.authPayload = decodedToken;
  next();
};

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
  logger.logError(err.message);

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Malformed id' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: `Validation error ${err.message}` });
  }

  if (err.name === 'MongoServerError' && err.message && err.message.includes('E11000')) {
    return res.status(400).json({ error: `Duplicate resource: ${err.message}` });
  }

  if (err.name === 'AuthorizationError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next(err);
};

module.exports = { validateWith, unknownEndpoint, errorHandler, authenticate };
