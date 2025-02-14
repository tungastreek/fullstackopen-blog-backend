const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 5
  },
  author: String,
  url: String,
  likes: Number,
});

blogSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = doc._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

const BlogModel = mongoose.model('Blog', blogSchema);

module.exports = BlogModel;
