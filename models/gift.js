var mongoose = require('mongoose');
// var moment = require('moment');

var Schema = mongoose.Schema;

var GiftSchema = Schema({
  name: {type: String, required: true},
  image_url: {type: String},
  amazon_url: {type: String},
  price: {type: Number}, // In dollars
  categories: [{type: Schema.ObjectId, ref: 'Genre'}],
  // reviews: [{...}]
});

// Virtual for a gift's URL
GiftSchema
.virtual('url')
.get(function () {
  return '/catalog/gift/' + this._id;
});

//Export model
module.exports = mongoose.model('Gift', GiftSchema);