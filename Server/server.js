// Start up server to Listen a request
var express = require('express');
var app  = express();
var MongoClient = require('mongodb').MongoClient;
var port = 7777;
app.listen(port);

app.use(express.static('../public'));

app.get('/tweets/apple', function(req, res) {

  MongoClient.connect('mongodb://localhost:27017/tweets', function(err, db) {

    var col = db.collection('apple');
    col.find({"geo":{$ne:null}}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });

  });

});

app.get('/tweets/oscars', function(req, res) {

  MongoClient.connect('mongodb://localhost:27017/tweets', function(err, db) {

    var col = db.collection('oscars');
    col.aggregate({
        $group: {
            _id: {
                country: "$country",
                code: "$country_code"
            },
            total_tweets: {
                $sum: 1
            }
        }
    }, function(err, result) {
        res.send(result);
    });

  });

});