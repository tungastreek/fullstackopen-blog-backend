const UserModel = require('../src/models/user');
const { generatePasswordHash } = require('../src/utils/password-utils');

const DEFAULT_PASSWORD = 'sekret';

// Initialize users with consistent password hashes
const initializeUsers = async () => {
  // Create password hashes for test users
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

const nonExistingId = async () => {
  const user = new UserModel({
    username: 'willremovethissoon',
    name: 'Will Remove',
    passwordHash: 'doesntmatter',
  });

  await user.save();
  await user.deleteOne();

  return user._id.toString();
};

module.exports = {
  initializeUsers,
  usersInDb,
  nonExistingId,
  DEFAULT_PASSWORD,
};
