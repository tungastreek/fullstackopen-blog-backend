const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const supertest = require('supertest');
const mongoose = require('mongoose');

const UserModel = require('../src/models/user');
const app = require('../src/app');
const { initializeUsers, usersInDb, nonExistingId } = require('./user-api-test-helper');

const api = supertest(app);
let initialUsers;

describe('User API', () => {
  beforeEach(async () => {
    // Get initialized users with consistent password hashes
    initialUsers = await initializeUsers();

    await UserModel.deleteMany({});

    // Create users with hashed passwords
    const userObjects = initialUsers.map((user) => new UserModel(user));
    const promiseArray = userObjects.map((user) => user.save());
    await Promise.all(promiseArray);
  });

  describe('GET /api/users', () => {
    test('returns all users as JSON', async () => {
      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(response.body.length, initialUsers.length);
    });

    test('returns users without passwordHash', async () => {
      const response = await api.get('/api/users');

      response.body.forEach((user) => {
        assert(!user.passwordHash, 'passwordHash should not be returned');
      });
    });

    test('returns 404 for non-existing user id', async () => {
      const nonExistingUserId = await nonExistingId();

      await api.get(`/api/users/${nonExistingUserId}`).expect(404);
    });
  });

  describe('POST /api/users', () => {
    test('succeeds with valid data', async () => {
      const newUser = {
        username: 'newuser',
        name: 'New User',
        password: 'password123',
      };

      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, initialUsers.length + 1);

      const usernames = usersAtEnd.map((user) => user.username);
      assert(usernames.includes(newUser.username));
    });

    test('fails with status 400 if username already exists', async () => {
      const newUser = {
        username: initialUsers[0].username, // Existing username
        name: 'Duplicate User',
        password: 'password123',
      };

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(result.body.error.includes('Duplicate'));

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, initialUsers.length);
    });

    test('fails with status 400 if username is too short', async () => {
      const newUser = {
        username: 'ab', // Less than 3 characters
        name: 'Short Username',
        password: 'password123',
      };

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(result.body.error.includes('Validation'));

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, initialUsers.length);
    });

    test('fails with status 400 if username is missing', async () => {
      const newUser = {
        name: 'Missing Username',
        password: 'password123',
      };

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(result.body.error.includes('required'));

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, initialUsers.length);
    });

    test('fails with status 400 if password is too short', async () => {
      const newUser = {
        username: 'validuser',
        name: 'Valid User',
        password: 'ab', // Less than 3 characters
      };

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(result.body.error.includes('Validation'));

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, initialUsers.length);
    });

    test('fails with status 400 if password is missing', async () => {
      const newUser = {
        username: 'validuser',
        name: 'Valid User',
      };

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/);

      assert(result.body.error.includes('required'));

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, initialUsers.length);
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
