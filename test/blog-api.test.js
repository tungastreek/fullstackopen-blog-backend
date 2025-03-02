const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const BlogModel = require('../src/models/blog');
const { initialBlogs } = require('./blog-api-test-helper');

const app = require('../src/app');
const supertest = require('supertest');

const api = supertest(app);

beforeEach(async () => {
  await BlogModel.deleteMany({});
  await BlogModel.insertMany(initialBlogs);
});

describe('when there is initially some blogs saved', () => {
  test('blogs are correctedly returned as json', async () => {
    const response = await api.get('/api/blogs');
    assert.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8');
    assert.strictEqual(response.body.length, initialBlogs.length);
    const titles = response.body.map((r) => r.title);
    assert(titles.includes('React patterns'));
    assert(response.body[0].id);
    assert(!response.body[0]._id);
  });
});

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'test author',
      url: 'test url',
      likes: 1,
    };
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAfter = await BlogModel.find({});
    assert.strictEqual(blogsAfter.length, initialBlogs.length + 1);

    const titles = blogsAfter.map((r) => r.title);
    assert(titles.includes('test blog'));
  });

  test('a blog without likes will default to 0', async () => {
    const newBlog = {
      title: 'test blog',
      author: 'test author',
      url: 'test url',
    };
    const response = await api.post('/api/blogs').send(newBlog);
    assert.strictEqual(response.statusCode, 201);
    assert.match(response.headers['content-type'], /application\/json/);

    const savedBlog = await BlogModel.findById(response.body.id);
    assert.strictEqual(savedBlog.likes, 0);
  });

  test('a blog without title will return 400', async () => {
    const newBlog = {
      author: 'test author',
      url: 'test url',
    };
    await api.post('/api/blogs').send(newBlog).expect(400);
  });
  test('a blog without url will return 400', async () => {
    const newBlog = {
      title: 'test title',
      author: 'test author',
    };
    await api.post('/api/blogs').send(newBlog).expect(400);
  });
  test('a blog without author will return 400', async () => {
    const newBlog = {
      title: 'test title',
      url: 'test url',
    };
    await api.post('/api/blogs').send(newBlog).expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
