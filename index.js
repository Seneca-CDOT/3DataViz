// Start up server to Listen a request
var express = require('express');
var app  = express();
var http = require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var io = require('socket.io')(http);
var kfs = require('fs');
var port = process.env.PORT || 7777;
var twitter = require('twitter');
var keys;
var client;

kfs.readFile('keys.json', 'utf8', function(err, data) {
  keys = JSON.parse(data);
  client = new twitter({ consumer_key: keys.consumer_key, consumer_secret: keys.consumer_secret, access_token_key: keys.token, access_token_secret: keys.token_secret });
});

app.listen(port);
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', "http://localhost:8000");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  next();
});
app.use(express.static('../public'));
app.all('/tweets/apple', function(req, res) {
  
  MongoClient.connect('mongodb://'+keys.user+':'+keys.key+'@ds043062.mongolab.com:43062/heroku_app37412051', function(err, db) {

    var col = db.collection('apple');
    col.find({"geo":{$ne:null}}).toArray(function(err, result) {
      if (err) throw err;
      res.header("Access-Control-Allow-Origin", "*");
      // res.header("Access-Control-Allow-Origin", "http://seneca-cdot.github.io/");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.send(result);
      db.close();
    });

  });

});

http.listen(port);
io.on('connection', function(socket){

  /**
   * socket.on('start')
   * Give a object includes filter keywords, language.
   * @param  {Object} data) filtering data.
   */
  socket.on('start', function (data) {
    console.log("start");
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
        throw error;
      });
    });

  });
  socket.on('stop', function (data) {
    process.exit();
  });

});