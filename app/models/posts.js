var mongoose = require('mongoose');
var postSchema = mongoose.Schema({
  // _creator : { type: String, ref: 'User' },
  title    : String,
  hashtag  : String,
  address  : String,
  photo    : String,
});

var Post  = mongoose.model('Post', postSchema);
module.exports = Post;