const mongoose = require('mongoose');
const { describe, test, beforeEach, after } = require('node:test');

const { initializeUsers, usersInDb, DEFAULT_PASSWORD } = require('./user-api-test-helper');
const supertest = require('supertest');
const app = require('../src/app');
const UserModel = require('../src/models/user');

const api = supertest(app);

describe('Login API', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({});
    const users = await initializeUsers();
    const userObjects = users.map((user) => new UserModel(user));
    const promiseArray = userObjects.map((user) => user.save());
    await Promise.all(promiseArray);
  });

  describe('POST /api/login', () => {
    test('should succeed with valid credentials', async () => {
      const users = await usersInDb();
      const user = users[0];
      const credentials = {
        username: user.username,
        password: DEFAULT_PASSWORD,
      };
      await api
        .post('/api/login')
        .send(credentials)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });
    test('should fail with status 401 when login with invalid credentials', async () => {
      const credentials = {
        username: 'invalidUser',
        password: 'invalidPassword',
      };
      await api
        .post('/api/login')
        .send(credentials)
        .expect(401)
        .expect('Content-Type', /application\/json/);
    });
    test('should fail with status 401 when login with invalid password', async () => {
      const users = await usersInDb();
      const user = users[0];
      const credentials = {
        username: user.username,
        password: 'invalidPassword',
      };
      await api
        .post('/api/login')
        .send(credentials)
        .expect(401)
        .expect('Content-Type', /application\/json/);
    });
    test('should fail with status 400 when missing username', async () => {
      const credentials = {
        password: DEFAULT_PASSWORD,
      };
      await api
        .post('/api/login')
        .send(credentials)
        .expect(400)
        .expect('Content-Type', /application\/json/);
    });
    test('should fail with status 400 when missing password', async () => {
      const users = await usersInDb();
      const user = users[0];
      const credentials = {
        username: user.username,
      };
      await api
        .post('/api/login')
        .send(credentials)
        .expect(400)
        .expect('Content-Type', /application\/json/);
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
