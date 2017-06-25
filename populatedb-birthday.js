#! /usr/bin/env node

console.log('This script populates some gifts, recipients, and events in your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

//Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var Genre = require('./models/genre')
var Gift = require('./models/gift')
var Recipient = require('./models/recipient')
var Event = require('./models/event')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var gifts = {}
var recipients = {}
var events = {}
var categories = {}

function createCategories() {
  categories.book = new Genre({name: 'Book'});
  categories.board_game = new Genre({name: 'Board Game'});
}

function createGifts() {
  gifts.scythe = new Gift({
    name: 'Scythe',
    image_url: 'https://images-na.ssl-images-amazon.com/images/I/71sShJFzHjL._SL1024_.jpg',
    amazon_url: 'https://www.amazon.com/Stonemaier-Games-STM600-Scythe-Board/dp/B01IPUGYK6',
    price: 61.32,
    categories: [categories.board_game]
  });

  gifts.awkward = new Gift({
    name: 'Awkward',
    image_url: 'https://images-na.ssl-images-amazon.com/images/I/51lGv1HNybL.jpg',
    amazon_url: 'https://www.amazon.com/gp/product/0316381306/ref=ox_sc_act_title_1?smid=ATVPDKIKX0DER&psc=1',
    price: 7.18,
    categories: [categories.book],
  });
}

function createRecipients() {
  recipients.alice = new Recipient({
    name: 'Alice',
    birth_month: 1,
    birth_day: 1,
  });

  recipients.bob = new Recipient({
    name: 'Bob',
    birth_month: 1,
    birth_day: 15,
  });
}

function createEvents() {
  events.alice2018 = new Event({
    date: '2018-01-01',
    name: 'Alice\'s Bday 2018',
    recipient: recipients.alice,
    gift: gifts.awkward,
    reminder: '2017-12-20',
  });

  events.bob2017 = new Event({
    date: '2017-09-21',
    name: 'Bob\'s Graduation',
    recipient: recipients.bob,
    gift: gifts.awkward,
    reminder: '2017-09-01',
  });

  events.bob2018 = new Event({
    date: '2019-01-15',
    name: 'Bob\'s Graduation',
    recipient: recipients.bob,
    gift: gifts.scythe,
    reminder: '2017-01-01',
  })
}

async function save(objects) {
  var promises = [];
  console.log(objects);
  for (var key in objects) {
    var value = objects[key]
    console.log('Saving ' + value);
    promises.push(value.save());
  }
  await Promise.all(promises);
}

async function saveAll() {
  await save(categories);
  await save(recipients);
  await save(gifts);
  await save(events);
}

createCategories();
createRecipients();
createGifts();
createEvents();
try {
  saveAll();
} catch (err) {
  console.log(err);
}


