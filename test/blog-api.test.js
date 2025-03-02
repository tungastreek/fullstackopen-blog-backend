const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');

const BlogModel = require('../src/models/blog');
const { initialBlogs, blogsInDb, nonExistingId } = require('./blog-api-test-helper');

const app = require('../src/app');
const supertest = require('supertest');
const { title } = require('node:process');

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

    const blogsAfter = await blogsInDb();
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

describe('updating a blog', () => {
  test('a blog can be updated with title', async () => {
    const blogs = await blogsInDb();
    const blogToUpdate = blogs[0];
    const newBlog = {
      ...blogToUpdate,
      title: 'updated title',
    };
    delete newBlog.id;

    const changedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(200);
    assert.strictEqual(changedBlog.body.title, 'updated title');
    assert.strictEqual(changedBlog.body.author, blogToUpdate.author);
    assert.strictEqual(changedBlog.body.url, blogToUpdate.url);
    assert.strictEqual(changedBlog.body.likes, blogToUpdate.likes);
  });

  test('a blog can be updated with author', async () => {
    const blogs = await blogsInDb();
    const blogToUpdate = blogs[0];
    const newBlog = {
      ...blogToUpdate,
      author: 'updated author',
    };
    delete newBlog.id;

    const changedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(200);
    assert.strictEqual(changedBlog.body.title, blogToUpdate.title);
    assert.strictEqual(changedBlog.body.author, 'updated author');
    assert.strictEqual(changedBlog.body.url, blogToUpdate.url);
    assert.strictEqual(changedBlog.body.likes, blogToUpdate.likes);
  });

  test('a blog can be updated with url', async () => {
    const blogs = await blogsInDb();
    const blogToUpdate = blogs[0];
    const newBlog = {
      ...blogToUpdate,
      url: 'updated url',
    };
    delete newBlog.id;

    const changedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(200);
    assert.strictEqual(changedBlog.body.title, blogToUpdate.title);
    assert.strictEqual(changedBlog.body.author, blogToUpdate.author);
    assert.strictEqual(changedBlog.body.url, 'updated url');
    assert.strictEqual(changedBlog.body.likes, blogToUpdate.likes);
  });

  test('a blog can be updated with likes', async () => {
    const blogs = await blogsInDb();
    const blogToUpdate = blogs[0];
    const newBlog = {
      ...blogToUpdate,
      likes: 100,
    };
    delete newBlog.id;

    const changedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(200);
    assert.strictEqual(changedBlog.body.title, blogToUpdate.title);
    assert.strictEqual(changedBlog.body.author, blogToUpdate.author);
    assert.strictEqual(changedBlog.body.url, blogToUpdate.url);
    assert.strictEqual(changedBlog.body.likes, 100);
  });

  test('a blog can be updated with multiple fields', async () => {
    const blogs = await blogsInDb();
    const blogToUpdate = blogs[0];
    const newBlog = {
      ...blogToUpdate,
      title: 'updated title',
      likes: 100,
    };
    delete newBlog.id;

    const changedBlog = await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(200);
    assert.strictEqual(changedBlog.body.title, 'updated title');
    assert.strictEqual(changedBlog.body.author, blogToUpdate.author);
    assert.strictEqual(changedBlog.body.url, blogToUpdate.url);
    assert.strictEqual(changedBlog.body.likes, 100);
  });

  test('update a blog with non existing id will return 404', async () => {
    const id = await nonExistingId();
    const blogs = await blogsInDb();
    const newBlog = {
      ...blogs[0],
      title: 'updated title',
    };

    delete newBlog.id;
    await api.put(`/api/blogs/${id}`).send(newBlog).expect(404);
  });

  test('update a blog with invalid id will return 400', async () => {
    const blogs = await blogsInDb();
    const newBlog = {
      ...blogs[0],
      title: 'updated title',
    };

    delete newBlog.id;
    await api.put('/api/blogs/invalid_id').send(newBlog).expect(400);
  });
});

describe('deletion of a blog', () => {
  test('a blog can be deleted', async () => {
    const blogs = await blogsInDb();
    const blogToDelete = blogs[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAfter = await blogsInDb();
    assert.strictEqual(blogsAfter.length, initialBlogs.length - 1);

    const titles = blogsAfter.map((r) => r.title);
    assert(!titles.includes(blogToDelete.title));
  });

  test('a blog that does not exist will return 404', async () => {
    const id = await nonExistingId();
    await api.delete(`/api/blogs/${id}`).expect(404);
  });

  test('a blog with invalid id will return 400', async () => {
    await api.delete('/api/blogs/invalid_id').expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
