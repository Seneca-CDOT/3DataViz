// Start up server to Listen a request
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// configuration for Twitter streaming API
var Twitter = require('../twitter')
  , kfs = require('fs')
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var keys;
var client;
kfs.readFile('keys.json', 'utf8', function(err, data) {
  keys = JSON.parse(data);
  client = new Twitter({ consumer_key: keys.consumer_key, consumer_secret: keys.consumer_secret, access_token_key: keys.token, access_token_secret: keys.token_secret });
});

var MongoClient = require('mongodb').MongoClient;

// Create a websocket connection
io.on('connection', function (socket) {

  /**
   * socket.on('start')
   * Give a object includes filter keywords, language.
   * @param  {Object} data) filtering data.
   */
  socket.on('start', function (data) {
    var obj = {};
    if(data.track) obj.track = data.track;
    if(data.language) obj.language = data.language;

    MongoClient.connect('mongodb://localhost:27017/tweets', function(err, db){ 
      client.stream('statuses/filter', obj, function(stream) {
        stream.on('data', function(tweet) {
          // if(tweet.geo){
            console.log(tweet.text);
            insertDocuments(db, data.collection, tweet);
          // }
        });

        stream.on('error', function(error) {
          console.log(error);
          throw error;
        });
      });
    });

  });
});

var insertDocuments = function(db, collection, tweet){
  var collection = db.collection(collection);
  collection.insert(tweet, function(err, result){
    console.log("inserted.");
  });
}