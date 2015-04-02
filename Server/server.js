// Start up server to Listen a request
var express = require('express');
var app  = express();
var MongoClient = require('mongodb').MongoClient;
var port = 7777;
var dbname = "tweets";
app.listen(port);

app.use(express.static('./public'));

MongoClient.connect('mongodb://localhost:27017/' + dbname, function(err, db) {

  if (err) console.log(err);
  else console.log('Server is running at ' + port + ' port');

  app.get('/tweets', function(req, res) {

    var col = db.collection('apple_event_2015s');
    col.find({"geo":{$ne:null}}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
    });

  });
});