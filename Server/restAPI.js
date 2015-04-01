// Start up server to Listen a request
var app = require('express')();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/tweets';

app.get('/', function(req, res){
	MongoClient.connect(url, function(err, db){
		res.json({message: 'hello'});
		db.close();
	});
});

app.get('/api', function(req, res){
	MongoClient.connect(url, function(err, db){
		res.json({message: 'hello'});
		db.close();
	});
});

app.listen(8080);