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
        this.airportMeshes = [];
        this.routes = [];
        this.createdAirports = [];
        this.createdAirplaness = [];
        this.paths = []

        // this is where I set up all the objects. Later on, I just instantiate them
        // with different positions/ rotations. This is the main improvement so far, 
        // performance wise

        this.airportGeometry = new THREE.SphereGeometry(this.cylinderRadius);
        this.airportMaterial = new THREE.MeshPhongMaterial({
            color: 0xadedff
        });

        this.pathMaterial = new THREE.LineBasicMaterial({
            color: 0xadedff,
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
        if (typeof(this.createdAirplaness) !== "undefined" && typeof(this.paths) !== "undefined") {

            for (var i = 0; i < this.createdAirplaness.length; i++) {

                if (this.createdAirplaness[i][2] >= 1) {

                    this.createdAirplaness[i][2] = 0;
                } else {

                    this.createdAirplaness[i][2] += this.createdAirplaness[i][1]
                }

                (this.t >= 1) ? this.t = 0: this.t += 0.005;

                pt = this.paths[i].getPoint(this.createdAirplaness[i][2]);
                this.createdAirplaness[i][0].position.set(pt.x, pt.y, pt.z);
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
    clickOn: function(event) {

        var x = event.clientX;
        var y = event.clientY;

        x -= this.container.offsetLeft;
        y -= this.container.offsetTop;

        var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);
        vector.unproject(this.camera);

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
        var intersects = ray.intersectObjects(this.airportMeshes);

        Application._vent.trigger('vizinfocenter/message/off');

        if (intersects[0]) {
            
            $.each(this.createdAirports, function(index, airport) {
                if (intersects[0].object == airport.mesh) {
                    Application._vent.trigger('vizinfocenter/message/on', airport.label);
                }
            });

            var destination = intersects[0].point;
            destination.setLength(this.controls.getRadius());
            this.cameraGoTo(destination);

        }else{
            
            Application.BaseGlobeView.prototype.clickOn.call(this, event);

        }

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

        // if(dataRecord == null || dataRecord.length == 0){
        //     Application._vent.trigger('vizinfocenter/message/on', "There is no data can visualize.");
        // }

        $.each(results, function(index, dataRecord) {

            time = time + 10;
            console.log(dataRecord);

            var timeoutref = setTimeout(function() {

                var airportFrom = {
                    longitude: dataRecord.from.longitude || null,
                    latitude: dataRecord.from.latitude || null,
                    label: dataRecord.fromLabel || null,
                }

                var airportTo = {
                    longitude: dataRecord.to.longitude || null,
                    latitude: dataRecord.to.latitude || null,
                    label: dataRecord.toLabel || null,
                }

                that.createAirportMesh(airportFrom);
                that.createAirportMesh(airportTo);
                
                var vF = Application.Helper.geoToxyz( airportFrom.longitude , airportFrom.latitude , 51);
                var vT = Application.Helper.geoToxyz( airportTo.longitude , airportTo.latitude , 51);
                var dist = vF.distanceTo(vT);
                that.createPath(vF, vT, dist);

                //gets the distance between the points. Maxium = 2*radius
                var speed = Application.Helper.map(dist, 0, that.globeRadius * 2, 0, 2.9);
                that.createAirplaneMesh(speed, that.paths[that.paths.length-1].getPoint(0));
                

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
    
    createPath: function(vT, vF, dist){

        // get the control points' vectors
        var cvT = vT.clone();
        var cvF = vF.clone();

        var xC = (0.5 * (vF.x + vT.x));
        var yC = (0.5 * (vF.y + vT.y));
        var zC = (0.5 * (vF.z + vT.z));

        var mid = new THREE.Vector3(xC, yC, zC);

        var smoothDist = Application.Helper.map(dist, 0, 10, 0, 15 / dist);

        mid.setLength(this.globeRadius * smoothDist);

        cvT.add(mid);
        cvF.add(mid);

        cvT.setLength(this.globeRadius * smoothDist);
        cvF.setLength(this.globeRadius * smoothDist);

        //create the bezier curve
        var pathGeometry = new THREE.Geometry();
        var curve = new THREE.CubicBezierCurve3(vF, cvF, cvT, vT);

        pathGeometry.vertices = curve.getPoints(35);
        var curveObject = new THREE.Line(pathGeometry, this.pathMaterial);
        
        this.paths.push(curve);
        this.scene.add(curveObject);

    },

    createAirplaneMesh: function(speed, point){

        //airplane 3D object
        var airplaneInstance = new THREE.Mesh(this.airplaneGeometry, this.airplaneMaterial);

        // airplane object for controlling the scene actors
        // it's got the 3D object, it's speed and current location
        var airplane = [ airplaneInstance, (3 - speed) / 500, 0 ];

        //gets the path first position
        airplaneInstance.position.copy(point);        

        this.createdAirplaness.push(airplane);
        this.scene.add(airplaneInstance);

    },

    createAirportMesh: function(airport) {

        // this is for object airports
        var airportInstance = new THREE.Mesh(this.airportGeometry, this.airportMaterial);
        airportInstance.rotation.y = airport.longitude * Math.PI / 180;

        var xRotationSign = airport.longitude + 90 > 90 ? -1 : 1;
        airportInstance.rotation.x = xRotationSign * (90 - airport.latitude) * Math.PI / 180;
        airportInstance.position.copy(Application.Helper.geoToxyz(airport.longitude, airport.latitude, 51));

        this.airportMeshes.push(airportInstance);

        airport.mesh = airportInstance;
        
        this.createdAirports.push(airport);
        this.scene.add(airportInstance);

    }

});
