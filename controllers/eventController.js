var Event = require('../models/event');
var Gift = require('../models/gift');
var Recipient = require('../models/recipient');
var Genre = require('../models/genre');

async function zipit (input) {
    var done = await Promise.all(Object.values(input));
    var keys = Object.keys(input);
    var data = {};
    for (var i = 0; i < keys.length; i++) {
        data[keys[i]] = done[i];
    }
    return data;
}

// Display list of all events
exports.event_list = async(req, res) => {
  var list = await Event.find()
    .populate('gift')
    .populate('recipient')
    .sort([['date', 'ascending']])
    .exec();
  res.render('event_list', {title: 'Event List', event_list: list});
}

// Show gifts to choose from 
exports.event_update_get = async(req, res) => {
  var data = await zipit({
    title: 'Update Event',
    event: Event.findById(req.params.id).populate('recipient').populate('gift').exec(),
    gifts: Gift.find(),
  });

  // For each gift, create a URL to add that gift to the event.
  for (var gift of data.gifts) {
    gift.event_url = `/catalog/event/${data.event._id}/gift/${gift._id}/create/`;
  }
  res.render('select_gift_form', data);
}

// TODO
exports.event_update_post = function(req, res) {
  res.render('')
}

// Add the specified gift to the event.
exports.event_create_gift_get = async(req, res) => {
  event = await Event.findById(req.params.event_id);
  event.gift = req.params.gift_id;
  await event.save();
  res.redirect('/catalog/events/');
}