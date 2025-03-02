const { test, describe } = require('node:test');
const assert = require('node:assert');

const listHelper = require('../src/utils/list-helper');

const { initialBlogs } = require('./blog-api-test-helper');

describe('Testing total likes', () => {
  test('No blogs', () => {
    assert.strictEqual(listHelper.totalLikes([]), 0);
  });

  test('One blog', () => {
    assert.strictEqual(
      listHelper.totalLikes([
        {
          _id: '5a422aa71b54a676234d17f8',
          title: 'Go To Statement Considered Harmful',
          author: 'Edsger W. Dijkstra',
          url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
          likes: 5,
          __v: 0,
        },
      ]),
      5
    );
  });

  test('Multiple blogs', () => {
    assert.strictEqual(listHelper.totalLikes(initialBlogs), 36);
  });
});

describe('Testing favorite blog', () => {
  test('No blog', () => {
    assert.strictEqual(listHelper.favoriteBlog([]), null);
  });

  test('One blog', () => {
    assert.deepStrictEqual(
      listHelper.favoriteBlog([
        {
          _id: '5a422aa71b54a676234d17f8',
          title: 'Go To Statement Considered Harmful',
          author: 'Edsger W. Dijkstra',
          url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
          likes: 5,
          __v: 0,
        },
      ]),
      {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
        likes: 5,
        __v: 0,
      }
    );
  });

  test('Multiple blogs with no tie', () => {
    assert.deepStrictEqual(listHelper.favoriteBlog(initialBlogs), {
      _id: '5a422b3a1b54a676234d17f9',
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      likes: 12,
      __v: 0,
    });
  });

  test('Multiple blogs with tie return first one', () => {
    assert.deepStrictEqual(
      listHelper.favoriteBlog(
        initialBlogs.concat({
          _id: '5a422b3a1b54a676234d17f8',
          title: 'Dummy title',
          author: 'Dummy author',
          url: 'Dummy url',
          likes: 12,
          __v: 0,
        })
      ),
      {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
        __v: 0,
      }
    );
  });
});

describe('Testing most blogs', () => {
  test('No blog', () => {
    assert.strictEqual(listHelper.mostBlogs([]), null);
  });

  test('One blog', () => {
    assert.deepStrictEqual(listHelper.mostBlogs([initialBlogs[0]]), {
      author: initialBlogs[0].author,
      blogs: 1,
    });
  });

  test('Multiple blogs', () => {
    assert.deepStrictEqual(listHelper.mostBlogs(initialBlogs), {
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });

  test('Multiple blogs with tie', () => {
    const dummyBlog = {
      author: 'Dummy',
      title: 'Dummy',
    };
    assert.deepStrictEqual(
      listHelper.mostBlogs(initialBlogs.concat([dummyBlog, dummyBlog, dummyBlog])),
      {
        author: 'Robert C. Martin',
        blogs: 3,
      }
    );
  });
});

describe('Testing most likes', () => {
  test('No blog', () => {
    assert.strictEqual(listHelper.mostLikes([]), null);
  });

  test('One blog', () => {
    assert.deepStrictEqual(listHelper.mostLikes([initialBlogs[0]]), {
      author: initialBlogs[0].author,
      likes: initialBlogs[0].likes,
    });
  });

  test('Multiple blogs', () => {
    assert.deepStrictEqual(listHelper.mostLikes(initialBlogs), {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });

  test('Multiple blogs with tie', () => {
    const dummyBlog1 = { author: 'Dummy', likes: 16 };
    const dummyBlog2 = { author: 'Dummy', likes: 1 };
    assert.deepStrictEqual(listHelper.mostLikes(initialBlogs.concat([dummyBlog1, dummyBlog2])), {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
