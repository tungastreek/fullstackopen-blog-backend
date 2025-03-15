const bcrypt = require('bcrypt');

const generatePasswordHash = async (password, saltRounds = 10) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
};

module.exports = {
  generatePasswordHash,
};
