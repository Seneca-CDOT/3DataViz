// Start up server to Listen a request
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

/**
 * MongoClient
 * Create connection to mongoDB
 */
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://localhost:27017/oscar-tweets', function(err, db){

  //Create a websocket connection
  io.on('connection', function (socket) {

    /**
     * socket.on('tweets/all')
     * Listen get request, it would return all data from the collection.
     * @param  {Object} data) database collection name, and return root.
     */
    socket.on('tweets/all', function (data) {
      var col = db.collection(data.collection);
      col.find().toArray(function(err, result) {
        if (err) throw err;
        socket.emit(data.returnroot, result);
      });
    });

    /**
     * socket.on('counts/country')
     * Get number of tweets filtered by country
     * @param  {Object} data) database collection name, and return root, country name.
     */
    socket.on('counts/country', function (data) {
      var col = db.collection(data.collection);
      var query = {"place.country" : data.country};
      col.count(query, function(err, result) {
        if (err) throw err;
        socket.emit(data.returnroot, result);
      });
    });

    /**
     * socket.on('counts/country_code')
     * Get number of tweets filtered by country code
     * @param  {Object} data) database collection name, and return root, country code.
     */
    socket.on('counts/country_code', function (data) {
      var col = db.collection(data.collection);
      var query = {"place.country_code" : data.country_code};
      col.count(query, function(err, result) {
        if (err) throw err;
        socket.emit(data.returnroot, result);
      });
    });

  });

});