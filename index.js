var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 5000
var kfs = require('fs');
var Twitter = require('twitter');
var MongoClient = require('mongodb').MongoClient;
var client;
var isOn = false;

kfs.readFile('keys.json', 'utf8', function(err, data) {
  keys = JSON.parse(data);
  client = new Twitter({ consumer_key: keys.consumer_key, consumer_secret: keys.consumer_secret, access_token_key: keys.token, access_token_secret: keys.token_secret });
});

app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)

var wss = new WebSocketServer({server: server})
wss.on("connection", function(ws) {
  isOn = true;
  ws.onmessage = function (event) {
    
    var data = JSON.parse(event.data);
    var count = 0;
    switch(data.type){
      case "start":
        var obj = {};
        var count =0;
        if(data.track) obj.track = data.track;        
        client.stream('statuses/filter',
          obj, function(stream) {
          stream.on('data', function(tweet) {
            if(isOn){
              if(tweet.coordinates){
                var msg = {
                  "type": "tweets",
                  "data": tweet
                }
                ws.send(JSON.stringify(msg));
              }
            }else{
              stream.destroy();
            }
          });
          stream.on('end', function() {
            console.log("end");
          });
          stream.on('error', function(error) {
            console.log("Please try again after a couple minutes..");
            // throw error;
          });
        });
        break;

      case "stop":
        isOn = false;
        break;

    }
  };
  
  ws.on("close", function() {
    isOn = false;
  })

});

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