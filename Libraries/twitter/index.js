//Twitter part
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

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', function (socket) {

  socket.on('start', function (data) {
    var obj = {};
    obj.track = data.track;
    if(data.lang) obj.language = data.lang;
    client.stream('statuses/filter',
      obj, function(stream) {
      stream.on('data', function(tweet) {
        if(tweet.geo){
          console.log(tweet);
          socket.emit('tweet', tweet);
        }
      });
      stream.on('end', function() {
        console.log("end");
      });
      stream.on('error', function(error) {
        throw error;
      });
    });
  });
  socket.on('stop', function (data) {
    console.log(data);
  });

});