var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var EventSchema = Schema({
  date: {type: Date, required: true},
  name: {type: String},
  recipient: {type: Schema.ObjectId, ref: 'Recipient'},
  gift: {type: Schema.ObjectId, ref: 'Gift'},
  reminder: {type: Date}
  // message: {type: String},
});

//Export model
module.exports = mongoose.model('Event', EventSchema);