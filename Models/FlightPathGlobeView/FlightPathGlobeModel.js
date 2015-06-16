var Application = Application || {};

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

// For flightPathView we need to parse the csv files.
// This is the best way I found to keep the backbone structure designed and 
// make my application work. So, yeah. Papaparse is doing the job
// The test.json is an object that contains {x:1}
Application.AirportsCollection = Application.BaseGlobeCollection.extend({
    model: Application.AirportModel,
    url: 'Models/data/test.json',
    parsed: false,
    initialize: function() {
        Application.BaseGlobeCollection.prototype.initialize.call(this);
    },
    preParse: function() {},
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
        for (var i = 0; i < x.data.length; i++) {
            tempAir.ID = x.data[i][0],
                tempAir.airport = x.data[i][1],
                tempAir.city = x.data[i][2],
                tempAir.country = x.data[i][3],
                tempAir.latitude = x.data[i][6],
                tempAir.longitude = x.data[i][7],
                tempAir.position3D = Application.Helper.geoToxyz(x.data[i][7], x.data[i][6], 50);
            // I need to check if this is the last object to be added to make sure
            // that when the View listens to it, the parsed flag is raised
            if (i >= x.data.length - 1)
                this.parsed = true;
            this.push(tempAir);
        }
    },
    destroy: function() {
      //  console.log("Destroy AirportsCollection");
        for (var i = 0; i < this.models.length; i++) {
            // this.models[i].destroy();
            this.models[i] = null;
        }
    }
});

Application.AirportRoutesCollection = Application.BaseGlobeCollection.extend({

    model: Application.AirportRouteModel,
    parsed: false,
    url: 'Models/data/test.json',
    initialize: function() {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
    },
    preParse: function() {
        var data = {};
        Application._vent.trigger('data/parsed', this.getViewConfigs(data));
    },
    parse: function(response) {
        var collection = that = this;
        var config = {
            dynamicTyping: true,
            download: true,
            complete: function(d) {
                that.fetchAirportRoutes(d);
               // Application._vent.trigger('data/parsed', that.getViewConfigs(d));
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
                x.data[i][1] != "\\N") {

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
    destroy: function() {
       // console.log("Destroy AirportRoutesCollection");
        for (var i = 0; i < this.models.length; i++) {
            // this.models[i].destroy();
            this.models[i] = null;
        }
    },
    getViewConfigs: function(data) {
        var defaults = {
            vizType: {
                name: 'vizType',
                list: ['geometry', 'texture']
            },
            vizLayer: {
                name: 'vizLayer',
                list: ['graph']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);
    }
});
