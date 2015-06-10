// Start up server to Listen a request
var express = require('express');
var app  = express();
var MongoClient = require('mongodb').MongoClient;
var port = 7777;
app.listen(port);

app.use(express.static('../public'));

// app.get('/tweets/apple', function(req, res) {

//   MongoClient.connect('mongodb://localhost:27017/tweets', function(err, db) {

//     var col = db.collection('apple');
//     col.find({"geo":{$ne:null}}).toArray(function(err, result) {
//       if (err) throw err;
//       res.send(result);
//       db.close();
//     });

//   });

// });


app.get('/twitterDB/apple/timefrom', function(req, res) {

  MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {

    var col = db.collection('wwdc2015');
    col.find({"geo":{$ne:null}}).sort({$natural:1}).limit(1).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });

  });

});

app.get('/twitterDB/apple/timeto', function(req, res) {

  MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {

    var col = db.collection('wwdc2015');
    col.find({"geo":{$ne:null}}).sort({$natural:-1}).limit(1).toArray(function(err, result) {
      if (err) throw err;
      res.send(result);
      db.close();
    });

  });

});


app.get('/twitterDB/apple', function(req, res) {

  MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {

    var col = db.collection('wwdc2015');
    col.find({"geo":{$ne:null}, "timestamp_ms": { $gt: "1433736000000", $lt: "1433822400000" }}).toArray(function(err, result) {
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

// db.wwdc2015.find({"geo":{$ne:null}}).sort({$natural:-1}).limit(1).pretty();  // the latest record 1433795674843
// db.wwdc2015.find({"geo":{$ne:null}}).sort({$natural:1}).limit(1).pretty();  // the earliest record 1433782572667
