var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');

var url = 'mongodb://localhost:27017/oscar-tweets';
MongoClient.connect(url, function(err, db){
  assert.equal(null, err);
  console.log("Connected correctly to server");

  // findDocuments(db, function(){});
  insertDocuments(db, function(){});
})


var findDocuments = function(db, callback){
  var collection = db.collection('tweets');
  collection.find({}).toArray(function(err, docs){
    assert.equal(err, null);
    console.log("Found the following records");
    console.dir(docs)
    callback(docs);
  })
}

var insertDocuments = function(db, callback){
  var collection = db.collection('tests');
  collection.insert([
    {a:1},{b:2},{a:3}
  ], function(err, result){
    console.log(result);
    assert.equal(err, null);
    assert.equal(3, result.result.n);
    assert.equal(3, result.ops.length);
    console.log("Inserted 3 documents into the document collection");
    // callback(result);
  });;
}


// module.exports = require('./lib/twitter')

// var kfs = require('fs'),
//     fs = require('fs'),
//     keys,
//     text = "",
//     counts = 0;

// kfs.readFile('keys.json', 'utf8', function(err, data) {
//   keys = JSON.parse(data);

//   var Twitter = require('node-tweet-stream') , t = new Twitter({
//       consumer_key: keys.consumer_key,
//       consumer_secret: keys.consumer_secret,
//       token: keys.token,
//       token_secret: keys.token_secret
//   })

//   fs = require('fs');
//   text += "{ \"tweets\": [\n";
//   fs.writeFile('oscar.json', text, function (err){});

//     t.on('tweet', function (tweet) {
//       if(tweet.geo){
//          text = "";
//          if(counts>0){ text += "\n," }
//          text += "{\"name\": \""+ tweet.user.name + "\", ";
//          text += "\"tweet\": \""+ escape(tweet.text) + "\", ";
//          text += "\"geo\":[" + tweet.geo.coordinates + "], \n";
//          if(tweet.place){
//            text += "    \"place\": {";
//            text += "\"id\": \""+tweet.place.id+"\",";
//            text += "\"place_type\": \""+tweet.place.place_type+"\",";
//            text += "\"name\": \""+tweet.place.name+"\",";
//            text += "\"full_name\": \""+tweet.place.full_name+"\",";
//            text += "\"country_code\": \""+tweet.place.country_code+"\",";
//            text += "\"country\": \""+tweet.place.country+"\",";
//            text += "\"coordinates\": ["+tweet.place.bounding_box.coordinates+"]";
//            text += "},\n";
//          }
//          text += "\"timestamp\": " + tweet.timestamp_ms +"} ";
//          counts++;
//          fs.appendFile('oscar.json', text, function (err){});
//        }
//     })
//     t.track('oscar');
//     t.on('error', function (err) {
//       console.log(err);
//     })
// });

// //need to add ]}