var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RecipientSchema = Schema({
  name: {type: String, required: true},
  birth_month: {type: Number, min: 1, max: 12, validate: {validator: Number.isInteger}},
  birth_day: {type: Number, min: 1, max: 31, validate: {validator: Number.isInteger}},
});

//Export model
module.exports = mongoose.model('Recipient', RecipientSchema);