require('dotenv').config();

const MONGODB_ENV_URI = {
  dev: process.env.DEV_MONGODB_URI,
  test: process.env.TEST_MONGODB_URI,
  prod: process.env.PROD_MONGODB_URI,
};

const PORT = process.env.PORT || 3001;
const MONGODB_URI = MONGODB_ENV_URI[process.env.NODE_ENV];

module.exports = {
  PORT,
  MONGODB_URI,
};
