var Application = Application || {};

// Data Record

Application.BaseDataRecord = Backbone.Model.extend({
    defaults: {

        timestamp: 0
    },
    initialize: function() {}
});

Application.GeoDataRecord = Application.BaseDataRecord.extend({

    defaults: _.extend({}, Application.BaseDataRecord.prototype.defaults, {
        longitude: 0,
        latitude: 0,
        city: ""
    }),
    initialize: function() {
        Application.BaseDataRecord.prototype.initialize.call(this);
    }
});

Application.AirportModel = Application.GeoDataRecord.extend({
    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {
        ID: 0,
        airport: "",
        country: "",
        position3D: ""
    }),
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }
});

Application.AirportRouteModel = Application.BaseDataRecord.extend({
        defaults: _.extend({}, Application.BaseDataRecord.prototype.defaults, {
            routeID: 0,
            sourceAirport: 0,
            destinationAirport: 0,
            numStops: 0,
            equipment: ""
        }),
        initialize: function() {
            Application.GeoDataRecord.prototype.initialize.call(this);
        }
    }),


    Application.StaticTwitterCountryRecord = Application.BaseDataRecord.extend({

        defaults: _.extend({}, Application.BaseDataRecord.prototype.defaults, {
            countrycode: "",
            countryname: "",
            total_tweets: 0
        }),
        initialize: function() {
            Application.BaseDataRecord.prototype.initialize.call(this);
        }
    });


Application.SpreadSheetRecord = Application.GeoDataRecord.extend({

    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }

});

Application.GoogleTrendsRecord = Application.BaseDataRecord.extend({

    defaults: _.extend({}, Application.BaseDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.BaseDataRecord.prototype.initialize.call(this);
    }

});

Application.GoogleTrendsCollection = Backbone.Collection.extend({
    model: Application.GoogleTrendsRecord,
    initialize: function(obj) {

        this._event = obj._event;
        this.response; // response from google trends
        var that = this;

        window.google = {
    visualization : {
      Query: {
        setResponse : function(data) {
         that.response = data;
         that._event.trigger('trends/changed');
        }
      }
   }
 }
    this._event.on('trends/changed', this.parse.bind(this));


    },
    parse: function() {

        var collection = this;

        $.each(this.response.table.rows, function(index, value) {

            var obj = {};
            obj.countrycode = value.c[0].v; // country code
            obj.percent = value.c[1].v; // percentage
            collection.push(obj);

        });

         this._event.trigger('trends/parsed', this.models );
    },
    setURL: function(key) {

        if (!key) return;
        this.url = 'http://www.google.com/trends/fetchComponent?q=' + key + '&cid=GEO_TABLE_0_0&export=3';
    },
    request: function () {
   
     var that = this;
       
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", this.url);
        document.getElementsByTagName("head")[0].appendChild(fileref);

        }
});


// Data Records Collection

// For flightPathView we need to parse the csv files.
// This is the best way I found to keep the backbone structure designed and 
// make my application work. So, yeah. Papaparse is doing the job
// The test.json is an object that contains {x:1}
Application.AirportsCollection = Backbone.Collection.extend({
    model: Application.AirportModel,
    url: 'Models/data/test.json',
    parsed: false,
    initialize: function() {},
    parse: function(response) {
        var that = this;
        var config = {
            dynamicTyping: true,
            download: true,
            complete: function(d) {
                that.fetchAirports(d);
                return that.models;
            }
        };
        // This is where I parse the CSV to a JSON object
        Papa.parse("Models/data/airports.csv", config);

    },
    fetchAirports: function(data) {
        //x.data[i][0] ID
        //x.data[i][1] Airport
        //x.data[i][2] City
        //x.data[i][3] Country
        //x.data[i][6] Lat
        //x.data[i][7] Lon
        var x = data;
        var tempAir = {};
        for( var i = 0 ; i < x.data.length ; i++ ){
            tempAir.ID         = x.data[i][0],
            tempAir.airport    = x.data[i][1],
            tempAir.city       = x.data[i][2],
            tempAir.country    = x.data[i][3],
            tempAir.latitude   = x.data[i][6],
            tempAir.longitude  = x.data[i][7],
            tempAir.position3D = Application.Helper.geoToxyz2(x.data[i][7], x.data[i][6], 50);
            // I need to check if this is the last object to be added to make sure
            // that when the View listens to it, the parsed flag is raised
            if( i >= x.data.length-1 )
                this.parsed = true;
            this.push(tempAir);
        }
    },
});

Application.AirportRoutesCollection = Backbone.Collection.extend({
    model: Application.AirportRouteModel,
    parsed: false,
    url: 'Models/data/test.json',
    initialize: function() {},
    parse: function(response) {
        var collection = that = this;
        var config = {
            dynamicTyping: true,
            download: true,
            complete: function(d) {
                that.fetchAirportRoutes(d);
                return that.models;
            }
        };
        Papa.parse("Models/data/routes.csv", config);
    },
    fetchAirportRoutes: function(data) {
        //x.data[i][0] route ID
        //x.data[i][3] source Airport id
        //x.data[i][5] destination airport id
        //x.data[i][7] stops
        //x.data[i][8] equipment
        var x = data;
        var temp = {};
        for (var i = 0; i < x.data.length; i++) {
            if (x.data[i][5] != "\\N" &&
                x.data[i][3] != "\\N" &&
                x.data[i][1] != "\\N"
            ) {
                temp.routeID = x.data[i][0],
                    temp.sourceAirport = x.data[i][3],
                    temp.destinationAirport = x.data[i][5],
                    temp.numStops = x.data[i][7],
                    temp.equipment = x.data[i][8];
                if (i >= x.data.length - 1)
                    this.parsed = true;
                this.push(temp);
            }
        }
    },

});


Application.SpreadSheetCollection = Backbone.Collection.extend({
    model: Application.SpreadSheetRecord,
    initialize: function() {

    },
    parse: function(response) {

        // console.log(response);

        var collection = this;

        for (i = 3; i < response.feed.entry.length; i = i + 3) {

            var obj = {};
            obj.city = response.feed.entry[i].content.$t;
            obj.longitude = response.feed.entry[i + 1].content.$t;
            obj.latitude = response.feed.entry[i + 2].content.$t;
            //obj.timestamp = response.feed.entry[i+3].content.$t;
            collection.push(obj);
        }

        return this.models;
    },

    setURL: function(key) {

        if (!key) return;
        this.url = 'https://spreadsheets.google.com/feeds/cells/' + key + '/1/public/basic?alt=json';
    }
});

Application.StaticTwitterCountriesCollection = Backbone.Collection.extend({
    model: Application.StaticTwitterCountryRecord,
    url: "tweets/oscars",
    initialize: function() {},
    parse: function(response) {
        var filter = {
            countrycode: "_id.code",
            countryname: "_id.country",
            total_tweets: "total_tweets"
        }
        return Application.Filter.extractJSON(filter, response);
    }
});

// Model

Application.BaseGlobeModel = Backbone.Model.extend({
    initialize: function() {},
    loadData: function() {}
});

Application.GlobeModel = Application.BaseGlobeModel.extend({
    initialize: function() {
        Application.BaseGlobeModel.prototype.initialize.call(this);
    },
    loadData: function() {
        var rawData = [{
            city: "Montreal",
            population: 3268513,
            latitude: 45.509,
            longitude: -73.558
        }, {
            city: "Toronto",
            population: 2600000,
            latitude: 43.7,
            longitude: -79.416
        }, {
            city: "Vancouver",
            population: 1837969,
            latitude: 49.25,
            longitude: -123.119
        }, {
            city: "Calgary",
            population: 1019942,
            latitude: 51.05,
            longitude: -114.085
        }, {
            city: "Ottawa",
            population: 812129,
            latitude: 45.411,
            longitude: -75.698
        }, {
            city: "Edmonton",
            population: 712391,
            latitude: 53.55,
            longitude: -113.469
        }, {
            city: "Mississauga",
            population: 668549,
            latitude: 43.579,
            longitude: -79.658
        }, {
            city: "North York",
            population: 636000,
            latitude: 43.676,
            longitude: -79.416
        }, {
            city: "Winnipeg",
            population: 632063,
            latitude: 49.884,
            longitude: -97.147
        }, {
            city: "Scarborough",
            population: 600000,
            latitude: 43.772,
            longitude: -79.257
        }];

        var populationGeoDataRecords = new Application.PopulationGeoDataRecords(rawData);
        // var populationGeoDataRecords = new PopulationGeoDataRecords();
        // for (var index = 0; index < rawData.length; ++index) {
        //  // do some preprocessing if needed

        //  var populationGeoDataRecord = new PopulationGeoDataRecord(rawData[index])
        //  populationGeoDataRecords.add(populationGeoDataRecord);
        // }
        return populationGeoDataRecords;
    }
});

Application.Tweet = Application.GeoDataRecord.extend({

    defaults: {
        text: "",
    },
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }
});

Application.Tweets = Backbone.Collection.extend({
    model: Application.Tweet,
    url: "tweets/apple",
    initialize: function() {},
    parse: function(response) {
        var filter = {
            longitude: "geo.coordinates[1]",
            latitude: "geo.coordinates[0]",
            text: "text",
            timestamp: "timestamp_ms",
        }
        return Application.Filter.extractJSON(filter, response);
    }
});
