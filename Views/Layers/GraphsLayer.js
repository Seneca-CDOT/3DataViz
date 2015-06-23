/**
 ** @author Bruno Di Giuseppe / smokingcobra.com
 **/
var Application = Application || {};

Application.GraphsLayer = Application.BaseGlobeView.extend({

    initialize: function(decorator, collections) {

        Application.BaseGlobeView.prototype.initialize.call(this, decorator, collections);

        //time factor for animations
        this.t = 0;

        this.timer = []; // array of timers for setTimeout

        //variables used to set the size of the objects and camera/controls orientation
        this.cylinderRadius = this.globeRadius * 0.01;
        this.cylinderHeight = this.globeRadius / 500;

        // Arrays for controlling the scene actors
        this.airports = [];
        this.routes = [];
        this.createdAirports = [];
        this.movingGuys = [];

        // this is where I set up all the objects. Later on, I just instantiate them
        // with different positions/ rotations. This is the main improvement so far, 
        // performance wise

        this.airportGeometry = new THREE.SphereGeometry(this.cylinderRadius, 8, 8);
        this.blueMaterial = new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            side: THREE.DoubleSide
        });

        this.pathMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            transparent: true,
        });

        this.airplaneGeometry = new THREE.TetrahedronGeometry(this.cylinderRadius);
        this.airplaneMaterial = new THREE.MeshBasicMaterial({
            color: 0xa4c800
        });
    },
    destroy: function() {

        var that = this;

        console.log("GraphsLayer Destroy");

        Application.BaseGlobeView.prototype.destroy.call(this);

        // Application._vent.unbind('globe/ready');

    },
    // visualization specific functionality
    updateGlobe: function() {

        //this is going to move the airplanes around the world.
        // First we check to see if there are paths and planes
        // second, we iterate through the airplanes list
        // then we check to see if the path is finished or not
        // then black magic and things move.
        if (typeof(movingGuys) !== "undefined" && typeof(paths) !== "undefined") {

            for (var i = 0; i < this.movingGuys.length; i++) {

                if (this.movingGuys[i][2] >= 1) {

                    this.movingGuys[i][2] = 0;
                } else {

                    this.movingGuys[i][2] += this.movingGuys[i][1]
                }

                (this.t >= 1) ? this.t = 0: this.t += 0.005;

                pt = paths[i].getPoint(this.movingGuys[i][2]);
                this.movingGuys[i][0].position.set(pt.x, pt.y, pt.z);
            }
        }

        Application.BaseGlobeView.prototype.updateGlobe.call(this);
    },

    // data ready checks to see if both csv's have been loaded
    showResults: function() {

        console.log("GraphsLayer showResults");
        Application._vent.trigger('controlpanel/message/off');
        this.addPaths();

    },
    // core function of the application. THIS IS WHERE THE MAGIC HAPPENS
    addPaths: function() {
        var i = 0
        var dataRecord;
        var randomIndex;

        var results = this.collection[0].models;
        var srcAirport;
        var destAirport;
        var time = 100;
        var that = this;
        var timeoutref = null;

        $.each(results, function(index, dataRecord) {

            time = time + 10;

            console.log(dataRecord);

            var timeoutref = setTimeout(function() {
                // get a random route)
                // randomIndex = that.getRandomInt(1, 65000);
                // randomIndex = that.getRandomInt(1, 65000);
                // if (routes[randomIndex] != null) {

                    // get destination and source airports for the chosen route
                    // srcAirport = that.getAirport(dataRecord.sourceAirport);
                    // destAirport = that.getAirport(dataRecord.destinationAirport);

                    //sets up the vector points for the airports
                    // var vT = srcAirport.position3D;
                    // var vF = destAirport.position3D;
                    var vT = Application.Helper.geoToxyz( dataRecord["geofrom-y"] , dataRecord["geofrom-x"] , 51);
                    var vF = Application.Helper.geoToxyz( dataRecord["geoto-y"] , dataRecord["geoto-x"] , 51);

                    // let's check if the airport object has been instantiated already
                    // if (!that.airportCreated(srcAirport.ID)) {
                        that.addAirport(dataRecord["geofrom-y"], dataRecord["geofrom-x"]);
                    // }
                    // if (!that.airportCreated(destAirport.ID)) {
                    // 
                        that.addAirport(dataRecord["geoto-y"], dataRecord["geoto-x"]);
                    // }

                    //gets the distance between the points. Maxium = 2*radius
                    var dist = vF.distanceTo(vT);

                    // get the control points' vectors
                    var cvT = vT.clone();
                    var cvF = vF.clone();

                    // some mathmagic
                    var xC = (0.5 * (vF.x + vT.x));
                    var yC = (0.5 * (vF.y + vT.y));
                    var zC = (0.5 * (vF.z + vT.z));

                    var mid = new THREE.Vector3(xC, yC, zC);

                    var smoothDist = Application.Helper.map(dist, 0, 10, 0, 15 / dist);

                    mid.setLength(that.globeRadius * smoothDist);

                    cvT.add(mid);
                    cvF.add(mid);

                    cvT.setLength(that.globeRadius * smoothDist);
                    cvF.setLength(that.globeRadius * smoothDist);

                    //create the bezier curve
                    var pathGeometry = new THREE.Geometry();
                    var curve = new THREE.CubicBezierCurve3(vF, cvF, cvT, vT);

                    // this sets the number of vertices on the paths,
                    // their resolution, how good they look.
                    // the smaller the number, the squarer it'll look
                    pathGeometry.vertices = curve.getPoints(15);

                    // Create the final Object3d to add to the this.scene

                    var curveObject = new THREE.Line(pathGeometry, that.pathMaterial);
                    // paths.push(curve);
                    that.scene.add(curveObject);

                    var speed = Application.Helper.map(dist, 0, that.globeRadius * 2, 0, 2.9);

                    //airplane sprite
                    // var airplaneInstance = new THREE.Sprite(that.airplaneSpriteMaterial);

                    //airplane 3D object
                    var airplaneInstance = new THREE.Mesh(that.airplaneGeometry, that.airplaneMaterial);

                    // airplane object for controlling the scene actors
                    // it's got the 3D object, it's speed and current location
                    var airplane = [
                        airplaneInstance, (3 - speed) / 500,
                        0
                    ];

                    // finally we add the airplane to the array 
                    // that'll keep track of everything
                    that.movingGuys.push(airplane);

                    //gets the path first position
                    airplaneInstance.position.copy(curve.getPoint(0));
                    that.scene.add(airplaneInstance);

                // }
              // if (i == 1) {   Application._vent.trigger('controlpanel/message/off'); }
            }, time);

            that.timer.push(timeoutref);
        });
       
    },
    // checks to see if the airport has been created
    airportCreated: function(id) {

        for (var i = 0; i < this.createdAirports.length; i++) {
            if (this.createdAirports[i] == id) {
                return true;
                break;
            }
        }
        return false;
    },
    // returns an airport from with a given ID
    getAirport: function(id) {
        for (i in this.collection[0].models) {

            if (id == this.collection[0].models[i].attributes.ID) {

                return this.collection[0].models[i].attributes;
            }
        }
    },
    // gives you a random number within a range
    getRandomInt: function(min, max) {

        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    //this is going to add the airports to the list and instantiate them to the scene.
    addAirport: function(latitude, longitude) {
        // this is for object airports
        var airportInstance = new THREE.Mesh(this.airportGeometry, this.blueMaterial);
        airportInstance.rotation.y = latitude * Math.PI / 180;

        var xRotationSign = latitude + 90 > 90 ? -1 : 1;
        airportInstance.rotation.x = xRotationSign * (90 - longitude) * Math.PI / 180;

        // this is for spirtes.
        // var airportInstance = new THREE.Sprite(this.airportSpriteMaterial);

        airportInstance.position.copy(Application.Helper.geoToxyz(latitude, longitude, 51));
        // this.createdAirports.push(airport.ID);
        this.scene.add(airportInstance);
    }
});
