const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
  },
  name: String,
  passwordHash: {
    type: String,
    required: true,
  },
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog',
    },
  ],
});

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = doc._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
  },
});

const UserModel = mongoose.model('User', UserSchema);

module.exports = UserModel;
