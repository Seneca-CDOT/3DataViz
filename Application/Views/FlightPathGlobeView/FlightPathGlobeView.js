/**
 ** @author Bruno Di Giuseppe / smokingcobra.com
 **/
var Application = Application || {};

Application.FlightPathGlobeView = Application.BaseGlobeView.extend({

    initialize: function() {

        Application.BaseGlobeView.prototype.initialize.call(this);

        //time factor for animations
        this.t = 0;

        //variables used to set the size of the objects and camera/controls orientation
        this.cylinderRadius = this.globeRadius * 0.0085;
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
            opacity: .5,
        });

        this.airplaneGeometry = new THREE.TetrahedronGeometry(this.cylinderRadius);
        this.airplaneMaterial = new THREE.MeshBasicMaterial({
            color: 0xa4c800
        });

        // Here I listen for collection entries to know when they are loaded. 
        // I don't really think I need it anymore, let me check...
        // I think it is needed, so.... yeah. You do need it.
        this.collection[0].bind("add", this.dataReady, this);
        this.collection[1].bind("add", this.dataReady, this);

        // Simple, fetch the collections
        this.collection[1].fetch();
        this.collection[0].fetch();
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
    dataReady: function() {

        if (this.collection[0].parsed && this.collection[1].parsed) {
            this.addPaths();
        }
    },
    // core function of the application. THIS IS WHERE THE MAGIC HAPPENS
    addPaths: function() {
        var i = 0
        var dataRecord;
        var randomIndex;

        var routes = this.collection[1].models;
        var srcAirport;
        var destAirport;
        var time = 100;
        var that = this;

        //let's iterate through all the routes
        for (dataRecordIndex in routes) {
            time = time + 10;
            ++i;
            //but let's take only the first 100, so we don't burn the computer
            if (i > 1000) break;
            // time out is going to give it an interval between 
            // instantiating each route
            setTimeout(function() {
                // get a random route
                randomIndex = that.getRandomInt(1, 65000);
                dataRecord = routes[randomIndex].attributes;

                // get destination and source airports for the chosen route
                srcAirport = that.getAirport(dataRecord.sourceAirport);
                destAirport = that.getAirport(dataRecord.destinationAirport);

                //sets up the vector points for the airports
                var vT = srcAirport.position3D;
                var vF = destAirport.position3D;

                // let's check if the airport object has been instantiated already
                if (!that.airportCreated(srcAirport.ID)) {
                    that.addAirport(srcAirport);
                }
                if (!that.airportCreated(destAirport.ID)) {
                    that.addAirport(destAirport);
                }

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
                paths.push(curve);
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
            }, time);
        }
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
    addAirport: function(airport) {
        // this is for object airports
        var airportInstance = new THREE.Mesh(this.airportGeometry, this.blueMaterial);
        airportInstance.rotation.y = airport.latitude * Math.PI / 180;

        var xRotationSign = airport.latitude + 90 > 90 ? -1 : 1;
        airportInstance.rotation.x = xRotationSign * (90 - airport.longitude) * Math.PI / 180;

        // this is for spirtes.
        // var airportInstance = new THREE.Sprite(this.airportSpriteMaterial);

        airportInstance.position.copy(airport.position3D);
        this.createdAirports.push(airport.ID);
        this.scene.add(airportInstance);
    }
});
