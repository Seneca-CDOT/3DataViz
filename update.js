var MongoClient = require('mongodb').MongoClient;
var ctr = 0;
var request = require('request');
var countries = [];
//var data;
var dba;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/mydb", function(err, db) {
    if (!err) {
        console.log("We are connected");
    }

    var c = 0;
    // dba = db;

    db.collection('oscars', function(err, coll) { // create and specify a collection

        // console.log( "coll was: ", coll, ++c );

        var data = coll.find();
        var item = {};

        data.each(function(err, doc) {
            //console.log( ++ctr );
            if (doc !== null) {
                // console.log( doc._id ); 
                item.id = ctr;
                ctr++;
                // console.log( ctr );
                item.lat = doc.geo.coordinates[0];
                item.lon = doc.geo.coordinates[1];
                countries.push(item);

            }

            if (ctr == 13366) {
                console.log(countries.length);
                dorequest();

            }


        });

    });

});


function dorequest() {

    var i = 0;

    //console.log( countries.length );

    var loop = setInterval(function() {

        var req = 'http://api.geonames.org/countrySubdivisionJSON?lat=' + countries[i].lat + '&lng=' + countries[i].lon + '&username=3dataviz';

        request(req, function(error, response, body) {

            if (error) console.log(error);

            var obj = JSON.parse(body);
            //console.log ( '1 ' + obj.countryName );
            countries[i].countryName = obj.countryName;
            //console.log ( '2 ' + countries[i].countryName );
            countries[i].countryCode = obj.countryCode;

            i++;
            console.log(i, obj.countryName);

            if (i == 13366) {

                clearInterval(loop);
                insert();

            }
        });

    }, 20);

    //}
}


function insert() {

    var i = 0;

    console.log("insert started ");

    MongoClient.connect("mongodb://localhost:27017/mydb", function(err, db) {

        db.collection('oscars', function(err, coll) {

            var data = coll.find();

            data.each(function(err, doc) {

                //console.log( i );

                //if ( doc !== null ) { 

                // if ( i < 6 ) console.log ( "country is " + countries[i] );

                coll.update(doc, {
                        $set: {
                            'country': countries[i].countryName,
                            'countryCode': countries[i].countryCode
                        }
                    }, {
                        multi: true
                    }, function(err, result)

                    {
                        if (err) console.log(err);
                    });

                i++;
                //}  

                if (i == 16336) {

                    console.log('done insert');

                }


            });

        });

    });

    // var req = 'http://api.geonames.org/neighbourhoodJSON?lat=' + lat + '&lng=' + lon + '&username=3dataviz';

    //   request(req, function (error, response, body) {

    //     console.log( body, response, error );

    //   });


}