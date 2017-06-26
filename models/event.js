var mongoose = require('mongoose');
var moment = require('moment');


var Schema = mongoose.Schema;

var EventSchema = Schema({
  date: {type: Date, required: true},
  name: {type: String},
  recipient: {type: Schema.ObjectId, ref: 'Recipient'},
  gift: {type: Schema.ObjectId, ref: 'Gift'},
  reminder: {type: Date}
  // message: {type: String},
});

// Virtual for event's URL
EventSchema
.virtual('url')
.get(function () {
  return '/catalog/event/' + this._id + '/update/';
});

// Virtual for human-formatted date.
EventSchema
.virtual('date_formatted')
.get(function () {
  return moment(this.date).format('MMMM Do, YYYY');
});

//Export model
module.exports = mongoose.model('Event', EventSchema);