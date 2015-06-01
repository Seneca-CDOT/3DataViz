// Start up server to Listen a request
var express = require('express');
var app  = express();
var MongoClient = require('mongodb').MongoClient;
var port = process.env.PORT || 7777;
var kfs = require('fs');

var keys;
var client;
kfs.readFile('keys.json', 'utf8', function(err, data) {
  keys = JSON.parse(data);
});

app.listen(port);

app.use(express.static('../public'));

app.get('/tweets/apple', function(req, res) {
  
  MongoClient.connect('mongodb://'+keys.user+':'+keys.key+'@ds043062.mongolab.com:43062/heroku_app37412051', function(err, db) {
  // MongoClient.connect('mongodb://localhost:27017/tweets', function(err, db) {
    console.log(db);

    var col = db.collection('apple');
    col.find({"geo":{$ne:null}}).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });

  });

});

app.get('/tweets/oscars', function(req, res) {

  MongoClient.connect('mongodb://'+keys.user+':'+keys.password+'@ds043062.mongolab.com:43062/heroku_app37412051', function(err, db) {
  // MongoClient.connect('mongodb://<dbuser>:<dbpassword>@ds043002.mongolab.com:43002/heroku_app37408641', function(err, db) {
    console.log(db);
    
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
