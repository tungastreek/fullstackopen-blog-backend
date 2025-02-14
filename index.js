const logger = require('./src/utils/logger');
const config = require('./src/utils/config');
const app = require('./src/app');

app.listen(config.PORT, () => {
  logger.info(`Server started on port: ${config.PORT}`);
});
