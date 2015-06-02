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

app.get('/tweets/oscars', function(req, res) {

  MongoClient.connect('mongodb://'+keys.user+':'+keys.password+'@ds043062.mongolab.com:43062/heroku_app37412051', function(err, db) {
    
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
      res.header("Access-Control-Allow-Origin", "*");
      // res.header("Access-Control-Allow-Origin", "http://seneca-cdot.github.io/");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.send(result);
      db.close();
    });

  });

});
