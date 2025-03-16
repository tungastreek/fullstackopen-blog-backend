const UserModel = require('../src/models/user');
const { generatePasswordHash } = require('../src/utils/password-utils');

const DEFAULT_PASSWORD = 'sekret';

const initializeUsers = async () => {
  const passwordHash = await generatePasswordHash(DEFAULT_PASSWORD);

  return [
    {
      username: 'root',
      name: 'Superuser',
      passwordHash,
    },
    {
      username: 'testuser',
      name: 'Test User',
      passwordHash,
    },
  ];
};

const usersInDb = async () => {
  const users = await UserModel.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initializeUsers,
  usersInDb,
  DEFAULT_PASSWORD,
};
