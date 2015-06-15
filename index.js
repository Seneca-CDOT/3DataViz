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
var timerArray = [];
    
kfs.readFile('keys.json', 'utf8', function(err, data) {
    keys = JSON.parse(data);
    client = new Twitter({
        consumer_key: keys.consumer_key,
        consumer_secret: keys.consumer_secret,
        access_token_key: keys.token,
        access_token_secret: keys.token_secret
    });
    dbpath = 'mongodb://' + keys.user + ':' + keys.key + '@ds061611.mongolab.com:61611/heroku_app37445837';
});

app.use(express.static(__dirname + "/"))

var server = http.createServer(app)
server.listen(port)

var wss = new WebSocketServer({
    server: server
})
wss.on("connection", function(ws) {
    isOn = true;
    console.log("connection");
    ws.onmessage = function(event) {

        var data = JSON.parse(event.data);

        console.log("onmessage", data);

        var streamDB = function() {

            console.log("streamDB");
            var count = 0;
            switch (data.type) {
                case "start":
                    var obj = {};
                    var count = 0;
                    if (data.keyword) obj.keyword = data.keyword;

                    console.log("start");

                    MongoClient.connect('mongodb://' + keys.user + ':' + keys.key + '@ds061611.mongolab.com:61611/heroku_app37445837', function(err, db) {

                        console.log("connected?");
                        var col = db.collection('wwdc2015');
                        var obj = {
                            "geo": {
                                $ne: null
                            },
                            "timestamp_ms": {
                                $gt: String(data.timeFrom),
                                $lt: String(data.timeTo)
                            },
                            $text: { $search: data.input }
                        };

                        col.find(obj).toArray(function(err, results) {
                            console.log(err);
                            console.log(results);
                            if (err) throw err;

                            var time = 100;

                            results.forEach(function(result, index) {

                                time += 1000;

                                var timer = setTimeout(function() {

                                    if(ws){
                                      ws.send(JSON.stringify(result));
                                    }


                                }, time);


                                timerArray.push(timer);

                            });

                            db.close();
                        });

                    });
                break;

                case "stop":
                    console.log("remove timer");
                    timerArray.forEach(function(timer, index) {
                        clearTimeout(timer);
                    });

                    break;

            }

        }


        var streamLive = function() {


            var count = 0;
            switch (data.type) {
                case "start":
                    var obj = {};
                    var count = 0;
                    if (data.track) obj.track = data.track;
                    client.stream('statuses/filter',
                        obj,
                        function(stream) {
                            stream.on('data', function(tweet) {
                                if (isOn) {
                                    if (tweet.coordinates) {
                                        var msg = {
                                            "type": "tweets",
                                            "data": tweet
                                        }
                                        ws.send(JSON.stringify(msg));
                                    }
                                } else {
                                    stream.destroy();
                                }
                            });
                            stream.on('end', function() {
                                console.log("end");
                            });
                            stream.on('error', function(error) {
                                console.log(error, " - Please try again after a couple minutes..");
                                // throw error;
                            });
                        });
                    break;

                case "stop":
                    isOn = false;
                    break;

            }
        }

        switch (data.dataSource) {

            case "twitterDB":
                streamDB();
                break;
            case "twitterLive":
                streamLive();
                break;
        }


    }; // onmessage

    ws.on("close", function() {
        isOn = false;
    })

});

// app.all('/twitterDB/apple', function(req, res) {

//     MongoClient.connect('mongodb://' + keys.user + ':' + keys.key + '@ds061611.mongolab.com:61611/heroku_app37445837', function(err, db) {

//         var col = db.collection('apple');
//         col.find({
//             "geo": {
//                 $ne: null
//             },
//             "timestamp_ms": {
//                 $gt: 1433736000000,
//                 $lt: 1433822400000
//             }
//         }).toArray(function(err, result) {
//             if (err) throw err;
//             res.header("Access-Control-Allow-Origin", "*");
//             // res.header("Access-Control-Allow-Origin", "http://seneca-cdot.github.io/");
//             res.header("Access-Control-Allow-Headers", "X-Requested-With");
//             res.send(result);
//             db.close();
//         });
 
//     });

// });

app.get('/twitterDB/apple/timefrom', function(req, res) {

    MongoClient.connect(dbpath, function(err, db) {

        var col = db.collection('wwdc2015');
        col.find({
            "geo": {
                $ne: null
            }
        }).sort({
            $natural: 1
        }).limit(1).toArray(function(err, result) {
            if (err) throw err;
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.send(result);
            db.close();
        });

    });

});

app.get('/twitterDB/apple/timeto', function(req, res) {

    MongoClient.connect(dbpath, function(err, db) {

        var col = db.collection('wwdc2015');
        col.find({
            "geo": {
                $ne: null
            }
        }).sort({
            $natural: -1
        }).limit(1).toArray(function(err, result) {
            if (err) throw err;
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.send(result);
            db.close();
        });

    });

});