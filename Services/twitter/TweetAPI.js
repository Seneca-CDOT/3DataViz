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
     * socket.on('getall')
     * Listen get request, it would return all data from the collection.
     * @param  {Object} data) database collection name, and return root.
     */
    socket.on('getall', function (data) {

      var col = db.collection(data.collection);     
      col.find().toArray(function(err, result) {
        if (err) throw err;
        socket.emit(data.returnroot, result);
      });

    });

  });

});