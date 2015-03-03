/**
 * This script is made to complement our tweet data, which lacks country name and country codes.
 */

var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var ctr = 0;
var request = require('request');
var countries = [];
var dba;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/tweets", function(err, db) {
    if (!err) {
        console.log("We are connected");
    }

    var c = 0;
    dba = db;
    dba.collection('oscars_all', function(err, coll) { // create and specify a collection

        var data = coll.find();
        var ctr = 0;
        var stop = false;
        data.each(function(err, doc) {

            if (doc !== null) {
                var item = {};
                ctr++;
                item.id = ""+doc._id;
                if(doc.geo){
                    item.lat = doc.geo.coordinates[0];
                    item.lon = doc.geo.coordinates[1];
                }
                countries.push(item);
            }
            if (ctr == 16367) {
                console.log(countries);
                console.log(countries.length);
                dorequest();
                stop = true;
            }

        });

    });

});

/**
 * create request to geoname api. per 50 milli seconds.
 */
function dorequest() {

    // var i = 0;
    var i = 13159;
    var loop = setInterval(function() {

        i++;
        getNameAndInsert(countries[i], i);
        // getNameAndInsert(countries[i++], i);
        if (i == 16367) {
            clearInterval(loop);
        }
    }, 10);

}

/**
 * this creates a request to geonames.org. Pass latitude and longitude to get country name and code.
 */
function getNameAndInsert(item, idx) {
    
    if(item){

        var req = 'http://api.geonames.org/countrySubdivisionJSON?lat=' + item.lat + '&lng=' + item.lon + '&username=collamo';
        var updateObj = {};
        updateObj.id = item.id;

        request(req, function(error, response, body) {

            if (error) console.log(error);
            var obj = JSON.parse(body);
            
            console.log("No:"+idx+" --------------------------------------------------");

            console.log("_id: " + item.id);

            if(!obj.status){
                
                console.log("countryName: " +obj.countryName);
                console.log("countryCode: " +obj.countryCode);
                
                updateObj.country = obj.countryName;
                updateObj.country_code = obj.countryCode;

                //update data
                updateData(updateObj);

            }else{
                
                console.log("message: " +obj.status.message);

            }

        });

    }
}

/**
 * update database information
 */
var updateData = function(obj){
  var collection = dba.collection('oscars_all');
  console.log(obj.id);
  
  collection.update(
    {_id: ObjectID(obj.id) },
    {$set: {country: obj.country, country_code: obj.country_code }},
    function(err, result){
        if(result == 1){
            console.log("Insert Successfully completed ---------");
        }
  });
  
}