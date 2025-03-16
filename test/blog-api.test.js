const { test, after, beforeEach, describe } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');

const BlogModel = require('../src/models/blog');
const app = require('../src/app');
const { initialBlogs, blogsInDb, nonExistingId } = require('./blog-api-test-helper');
const { initializeUsers, usersInDb, DEFAULT_PASSWORD } = require('./user-api-test-helper');

const api = supertest(app);

describe('Blog API', () => {
  let token, wrongToken, loggedInUserId, savedBlogs;

  beforeEach(async () => {
    await initializeUsers();
    const users = await usersInDb();
    savedBlogs = initialBlogs.map((blog) => {
      blog.user = users[0].id;
      return blog;
    });
    await BlogModel.deleteMany({});
    await BlogModel.insertMany(savedBlogs);
    let response = await api
      .post('/api/login')
      .send({ username: users[0].username, password: DEFAULT_PASSWORD });
    token = response.body.token;
    loggedInUserId = users[0].id;

    response = await api
      .post('/api/login')
      .send({ username: users[1].username, password: DEFAULT_PASSWORD });
    wrongToken = response.body.token;
  });

  describe('GET /api/blogs', () => {
    test('blogs are returned as JSON', async () => {
      const response = await api.get('/api/blogs');
      assert.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8');
      assert.strictEqual(response.body.length, savedBlogs.length);
    });

    test('blogs have id property instead of _id', async () => {
      const response = await api.get('/api/blogs');
      assert(response.body[0].id);
      assert(!response.body[0]._id);
    });

    test('a specific blog is within the returned blogs', async () => {
      const response = await api.get('/api/blogs');
      const titles = response.body.map((blog) => blog.title);
      assert(titles.includes('React patterns'));
    });
  });

  describe('POST /api/blogs', () => {
    test('succeeds add a valid blog by logged in user', async () => {
      const newBlog = {
        title: 'test blog',
        author: 'test author',
        url: 'test url',
        likes: 1,
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const blogsAfter = await blogsInDb();
      assert.strictEqual(blogsAfter.length, savedBlogs.length + 1);

      const savedBlog = blogsAfter.find((blog) => blog.title === newBlog.title);
      assert(savedBlog.user.toString() === loggedInUserId);
    });

    test('fails with status code 401 if not logged in', async () => {
      const newBlog = {
        title: 'test blog',
        author: 'test author',
        url: 'test url',
        likes: 1,
      };

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(401)
        .expect('Content-Type', /application\/json/);
    });

    test('a blog without likes will default to 0', async () => {
      const newBlog = {
        title: 'test blog',
        author: 'test author',
        url: 'test url',
      };

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', `Bearer ${token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const savedBlog = await BlogModel.findById(response.body.id);
      assert.strictEqual(savedBlog.likes, 0);
    });

    test('fails with status code 400 if title is missing', async () => {
      const newBlog = {
        author: 'test author',
        url: 'test url',
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400);
    });

    test('fails with status code 400 if url is missing', async () => {
      const newBlog = {
        title: 'test title',
        author: 'test author',
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400);
    });

    test('fails with status code 400 if author is missing', async () => {
      const newBlog = {
        title: 'test title',
        url: 'test url',
      };

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400);
    });
  });

  describe('PUT /api/blogs/:id', () => {
    test('succeeds with valid data when updating title', async () => {
      const blogs = await blogsInDb();
      const blogToUpdate = blogs[0];
      const newBlog = {
        ...blogToUpdate,
        title: 'updated title',
      };
      delete newBlog.id;
      delete newBlog.user;

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.strictEqual(response.body.title, 'updated title');
      assert.strictEqual(response.body.author, blogToUpdate.author);
      assert.strictEqual(response.body.url, blogToUpdate.url);
      assert.strictEqual(response.body.likes, blogToUpdate.likes);
    });

    test('fails with status code 401 when not logged in', async () => {
      const blogs = await blogsInDb();
      const blogToUpdate = blogs[0];
      const newBlog = {
        ...blogToUpdate,
        title: 'updated title',
      };
      delete newBlog.id;
      delete newBlog.user;

      await api.put(`/api/blogs/${blogToUpdate.id}`).send(newBlog).expect(401);
    });

    test('fails with status code 401 when logged in as a different user', async () => {
      const blogs = await blogsInDb();
      const blogToUpdate = blogs[0];
      const newBlog = {
        ...blogToUpdate,
        title: 'updated title',
      };
      delete newBlog.id;
      delete newBlog.user;

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${wrongToken}`)
        .send(newBlog)
        .expect(401);
    });

    test('succeeds with valid data when updating author', async () => {
      const blogs = await blogsInDb();
      const blogToUpdate = blogs[0];
      const newBlog = {
        ...blogToUpdate,
        author: 'updated author',
      };
      delete newBlog.id;
      delete newBlog.user;

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(200);

      assert.strictEqual(response.body.title, blogToUpdate.title);
      assert.strictEqual(response.body.author, 'updated author');
      assert.strictEqual(response.body.url, blogToUpdate.url);
      assert.strictEqual(response.body.likes, blogToUpdate.likes);
    });

    test('succeeds with valid data when updating url', async () => {
      const blogs = await blogsInDb();
      const blogToUpdate = blogs[0];
      const newBlog = {
        ...blogToUpdate,
        url: 'updated url',
      };
      delete newBlog.id;
      delete newBlog.user;

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(200);

      assert.strictEqual(response.body.title, blogToUpdate.title);
      assert.strictEqual(response.body.author, blogToUpdate.author);
      assert.strictEqual(response.body.url, 'updated url');
      assert.strictEqual(response.body.likes, blogToUpdate.likes);
    });

    test('succeeds with valid data when updating likes', async () => {
      const blogs = await blogsInDb();
      const blogToUpdate = blogs[0];
      const newBlog = {
        ...blogToUpdate,
        likes: 100,
      };
      delete newBlog.id;
      delete newBlog.user;

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(200);

      assert.strictEqual(response.body.title, blogToUpdate.title);
      assert.strictEqual(response.body.author, blogToUpdate.author);
      assert.strictEqual(response.body.url, blogToUpdate.url);
      assert.strictEqual(response.body.likes, 100);
    });

    test('succeeds with valid data when updating multiple fields', async () => {
      const blogs = await blogsInDb();
      const blogToUpdate = blogs[0];
      const newBlog = {
        ...blogToUpdate,
        title: 'updated title',
        likes: 100,
      };
      delete newBlog.id;
      delete newBlog.user;

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(200);

      assert.strictEqual(response.body.title, 'updated title');
      assert.strictEqual(response.body.author, blogToUpdate.author);
      assert.strictEqual(response.body.url, blogToUpdate.url);
      assert.strictEqual(response.body.likes, 100);
    });

    test('fails with status code 404 if blog does not exist', async () => {
      const id = await nonExistingId();
      const blogs = await blogsInDb();
      const newBlog = {
        ...blogs[0],
        title: 'updated title',
      };
      delete newBlog.id;
      delete newBlog.user;

      await api
        .put(`/api/blogs/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(404);
    });

    test('fails with status code 400 if id is invalid', async () => {
      const blogs = await blogsInDb();
      const newBlog = {
        ...blogs[0],
        title: 'updated title',
      };
      delete newBlog.id;
      delete newBlog.user;

      await api
        .put('/api/blogs/invalid_id')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400);
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    test('succeeds with status code 204 if id is valid and logged in with valid user', async () => {
      const blogs = await blogsInDb();
      const blogToDelete = blogs[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const blogsAfter = await blogsInDb();
      assert.strictEqual(blogsAfter.length, savedBlogs.length - 1);

      const titles = blogsAfter.map((blog) => blog.title);
      assert(!titles.includes(blogToDelete.title));
    });

    test('fails with status code 401 if not logged in', async () => {
      const blogs = await blogsInDb();
      const blogToDelete = blogs[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401);
    });

    test('fails with status code 401 if logged in as a different user', async () => {
      const blogs = await blogsInDb();
      const blogToDelete = blogs[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${wrongToken}`)
        .expect(401);
    });

    test('fails with status code 404 if blog does not exist', async () => {
      const id = await nonExistingId();

      await api.delete(`/api/blogs/${id}`).set('Authorization', `Bearer ${token}`).expect(404);
    });

    test('fails with status code 400 if id is invalid', async () => {
      await api.delete('/api/blogs/invalid_id').set('Authorization', `Bearer ${token}`).expect(400);
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
