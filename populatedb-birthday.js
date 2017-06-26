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

var moment = require('moment');

var gifts = {}
var recipients = {}
var events = {}
var categories = {}

function createCategories() {
  categories.book = new Genre({name: 'Book'});
  categories.board_game = new Genre({name: 'Board Game'});
  categories.toy = new Genre({name: 'Toy'});
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

  gifts.frisbee = new Gift({
    name: 'Discraft Frisbee',
    image_url: 'https://images-na.ssl-images-amazon.com/images/I/71cWJ2zWbCL._SL1001_.jpg',
    amazon_url: 'https://www.amazon.com/gp/product/B0014LZVSK',
    price: 8.75,
    categories: [categories.toy],
  })
}

function createRecipients() {
  function create(ref, name, month, day) {
    recipients[ref] = new Recipient({
      name: name, birth_month: month, birth_day: day,
    });
  }
  create('lilly', 'Lilly An', 6, 2);
  create('michael', 'Michael Liu', 6, 3);
  create('karthik', 'Karthik Vemulapalli', 6, 21);
  create('shawn', 'Shawn Yifei Xie', 7, 25);
  create('mom', 'Mom', 8, 10);
  create('alice', 'Alice Pang', 9, 1);
  create('will', 'Will Xu', 9, 26);
  create('david', 'David Liu', 10, 2);
  create('akhil', 'Akhil Batra', 10, 17);
  create('alec', 'Alec Mouri', 10, 28);
  create('normand', 'Normand Overney', 11, 2);
}

function createEvents() {
  for (key in recipients) {
    var r = recipients[key];
    // JS month is 0-indexed...
    var bday = new Date(2017, r.birth_month-1, r.birth_day);
    events[key + '_bday_2017'] = new Event({
      date: bday,
      name: r.name + '\'s Bday 2017',
      recipient: r,
      reminder: moment(bday).subtract(7, 'days').toDate(),
      // gift: random(gifts or none),
    })
  }
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


