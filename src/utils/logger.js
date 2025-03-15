const { ENVIRONMENT_CONFIG } = require('./config');

const shouldSkipLog = () => ENVIRONMENT_CONFIG.isTest;

const info = (...params) => {
  console.log(...params);
};

const error = (...params) => {
  console.error(...params);
};

const logError = (message) => {
  if (ENVIRONMENT_CONFIG.isTest) return;
  error(message);
};

module.exports = { info, error, logError, shouldSkipLog };
