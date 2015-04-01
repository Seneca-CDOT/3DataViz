// Start up server to Listen a request
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// configuration for Twitter streaming API
var Twitter = require('twitter')
  , kfs = require('fs')
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var keys;
var client;
kfs.readFile('keys.json', 'utf8', function(err, data) {
  keys = JSON.parse(data);
  client = new Twitter({ consumer_key: keys.consumer_key, consumer_secret: keys.consumer_secret, access_token_key: keys.token, access_token_secret: keys.token_secret });
});

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

    client.stream('statuses/filter',
      obj, function(stream) {
      stream.on('data', function(tweet) {
        if(tweet.coordinates){
          console.log(tweet);
          socket.emit('tweet', tweet);
        }
      });
      stream.on('end', function() {
        console.log("end");
      });
      stream.on('error', function(error) {
        console.log(error);
        throw error;
      });
    });

  });
  socket.on('stop', function (data) {
    console.log(data);
  });

});