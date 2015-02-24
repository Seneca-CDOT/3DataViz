var Twitter = require('twitter')
  , kfs = require('fs')
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var keys;
kfs.readFile('keys.json', 'utf8', function(err, data) {
  keys = JSON.parse(data);
});


var url = 'mongodb://localhost:27017/mongotests';
MongoClient.connect(url, function(err, db){
  assert.equal(null, err);
  console.log("Connected correctly to server");

  var client = new Twitter({
    consumer_key: keys.consumer_key,
    consumer_secret: keys.consumer_secret,
    access_token_key: keys.token,
    access_token_secret: keys.token_secret
  });

  updateDocuments(db, function(){});

  // client.stream('statuses/filter',
  //   {
  //     track: 'Love',
  //     language: 'en',
  //     // locations: loc    
  //   }, function(stream) {
  //   stream.on('data', function(tweet) {
  //     // console.log(tweet);
  //     if(tweet.geo){
  //       console.log("==========================")
  //       console.log("Name: "+ tweet.user.name);
  //       console.log("Tweet: "+ tweet.text);
  //       console.log(tweet.geo);
  //       console.log("ProfileImage: "+ tweet.user.profile_image_url)
  //       console.log("Timestamp: "+ tweet.timestamp_ms);

  //       //insertDocuments(tweet.place, db, function(result){console.log(result)});
  //     }
  //   });

  //   stream.on('end', function() {
  //     console.log("end");
  //   });

  //   stream.on('error', function(error) {
  //     throw error;
  //   });

  // });

});

var insertDocuments = function(tweet, db, callback){
  var collection = db.collection('locs');
  collection.insert(tweet, function(err, result){    
    callback(result);
  });;
}


var updateDocuments = function(db, callback){
  var collection = db.collection('locs');
  collection.update({"id" : "36e1481a65f14144"}, {$set: {"CountryName": "CA" }  }, {w:1}, function(err) {
    if (err) console.warn(err.message);
    else console.log('successfully updated');
  });
}
