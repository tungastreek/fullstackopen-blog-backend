const { test, describe } = require('node:test');
const assert = require('node:assert');

const listHelper = require('../src/utils/list-helper');

const blogs = [
  {
    _id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    __v: 0,
  },
  {
    _id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0,
  },
  {
    _id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    __v: 0,
  },
  {
    _id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    __v: 0,
  },
  {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0,
  },
  {
    _id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    __v: 0,
  },
];

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
    assert.strictEqual(listHelper.totalLikes(blogs), 36);
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
    assert.deepStrictEqual(listHelper.favoriteBlog(blogs), {
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
        blogs.concat({
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
    assert.deepStrictEqual(listHelper.mostBlogs([blogs[0]]), { author: blogs[0].author, blogs: 1 });
  });

  test('Multiple blogs', () => {
    assert.deepStrictEqual(listHelper.mostBlogs(blogs), { author: 'Robert C. Martin', blogs: 3 });
  });

  test('Multiple blogs with tie', () => {
    const dummyBlog = {
      author: 'Dummy',
      title: 'Dummy',
    };
    assert.deepStrictEqual(listHelper.mostBlogs(blogs.concat([dummyBlog, dummyBlog, dummyBlog])), {
      author: 'Robert C. Martin',
      blogs: 3,
    });
  });
});

describe('Testing most likes', () => {
  test('No blog', () => {
    assert.strictEqual(listHelper.mostLikes([]), null);
  });

  test('One blog', () => {
    assert.deepStrictEqual(listHelper.mostLikes([blogs[0]]), {
      author: blogs[0].author,
      likes: blogs[0].likes,
    });
  });

  test('Multiple blogs', () => {
    assert.deepStrictEqual(listHelper.mostLikes(blogs), {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });

  test('Multiple blogs with tie', () => {
    const dummyBlog1 = { author: 'Dummy', likes: 16 };
    const dummyBlog2 = { author: 'Dummy', likes: 1 };
    assert.deepStrictEqual(listHelper.mostLikes(blogs.concat([dummyBlog1, dummyBlog2])), {
      author: 'Edsger W. Dijkstra',
      likes: 17,
    });
  });
});
