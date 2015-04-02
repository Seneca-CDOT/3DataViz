// Start up server to Listen a request
var express = require('express');
var app  = express();
var MongoClient = require('mongodb').MongoClient;
var port = 7777;
app.listen(port);

app.use(express.static('../public'));

MongoClient.connect('mongodb://localhost:27017/mydb', function(err, db) {

    if (err) console.log(err);
    else console.log('Server is running at ' + port + ' port');

app.get('/tweets', function(req, res) {
    
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

                    console.dir( result );
                    // socket.emit('result', result);
                    res.send(result);

                });


});