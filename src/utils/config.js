require('dotenv').config();

const PORT = process.env.PORT || 3001;

const ENVIRONMENT_CONFIG = {
  isTest: process.env.NODE_ENV === 'test',
  isDev: process.env.NODE_ENV === 'dev' || !process.env.NODE_ENV,
  isProd: process.env.NODE_ENV === 'prod',
};

const MONGODB_ENV_URI = {
  dev: process.env.DEV_MONGODB_URI,
  test: process.env.TEST_MONGODB_URI,
  prod: process.env.PROD_MONGODB_URI,
};

const MONGODB_URI = MONGODB_ENV_URI[process.env.NODE_ENV];

module.exports = {
  PORT,
  MONGODB_URI,
  ENVIRONMENT_CONFIG,
};
