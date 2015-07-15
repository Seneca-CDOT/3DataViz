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
        this.airportPoints = [];
        this.airports = [];
        this.airportMeshes = [];
        this.routes = [];
        this.createdAirports = [];
        this.createdAirplaness = [];
        this.paths = [];
        this.categories = [];
        this.moObjects = [];
        this.prevObjects = [];
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

        // console.log("GraphsLayer Destroy");

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

        var results = this.collection[0].models;
        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        }
        else if(
            !results[0].longitudeFrom 
            || !results[0].latitudeFrom
            || !results[0].longitudeTo
            || !results[0].latitudeTo
        )
        {
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }
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
                    if(airport.label != null){
                        Application._vent.trigger('vizinfocenter/message/on', airport.label);
                    }
                }
            });

            var destination = intersects[0].point;
            destination.setLength(this.controls.getRadius());
            this.cameraGoTo(destination);

        }else{
            
            Application.BaseGlobeView.prototype.clickOn.call(this, event);

        }

    },
    onMouseMove: function(e) {

        Application.BaseGlobeView.prototype.onMouseMove.call(this, e);
        var that = this;
        //ray casting  
        var closest = this.rayCast(this.moObjects, e);
        this.changePrevObjects();

        if ( closest != null ) {

            if(closest.object.name !== 'globe'){
                closest.object.material.linewidth = 8;

                this.prevObjects.push(closest);
                var data = closest.object.userData;
                var msg = "";
                if(typeof data.fromLabel !== 'undefined' && typeof data.toLabel !== 'undefined' && data.toLabel !== "" && data.fromLabel !== "" ){
                    msg += ( data.fromLabel + "  -  " + data.toLabel );
                }
                if(typeof data.value !== 'undefined'){
                    msg += ( " (" + data.value + ")" );
                }
                if(msg !== ""){
                    Application._vent.trigger('vizinfocenter/message/on', msg);
                }
                
            }else{
                this.changePrevObjects();
            }
        }else{
            this.changePrevObjects();
            Application._vent.trigger('vizinfocenter/message/off');
        }

    },
    changePrevObjects: function(){
        var that = this;
        if(typeof this.prevObjects !== 'undefined'){
            $.each(this.prevObjects, function(i, obj){
                if(typeof obj != 'undefined'){
                    obj.object.material.linewidth = 1;
                    that.prevObjects.splice( $.inArray(i, that.prevObjects) , 1 );
                }
            });
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
            if(dataRecord.latitudeFrom == null || dataRecord.longitudeFrom == null || dataRecord.latitudeTo== null || dataRecord.longitudeTo == null){
latitudeTo
            }

            var timeoutref = setTimeout(function() {

                // console.log(dataRecord);
                var category = that.getCategory(dataRecord.category);

                var airportFrom = {
                    longitude: dataRecord.longitudeFrom || null,
                    latitude: dataRecord.latitudeFrom || null,
                    label: dataRecord.fromLabel || null,
                }

                var airportTo = {
                    longitude: dataRecord.longitudeTo || null,
                    latitude: dataRecord.latitudeTo|| null,
                    label: dataRecord.toLabel || null,
                }

                if(!that.airportCreated(airportFrom)){
                    that.createAirportMesh(airportFrom, category);
                }
                if(!that.airportCreated(airportTo)){
                    that.createAirportMesh(airportTo, category);
                }
                
                var vF = Application.Helper.geoToxyz( airportFrom.longitude , airportFrom.latitude , 51);
                var vT = Application.Helper.geoToxyz( airportTo.longitude , airportTo.latitude , 51);
                var dist = vF.distanceTo(vT);
                var line = that.createPath(vF, vT, dist, category);
                line.userData = dataRecord;

                //gets the distance between the points. Maxium = 2*radius
                // var speed = Application.Helper.map(dist, 0, that.globeRadius * 2, 0, 2.9);
                // that.createAirplaneMesh(speed, that.paths[that.paths.length-1].getPoint(0), category);
                

            }, time);

            that.timer.push(timeoutref);
        });

        this.moObjects.push(this.globe);
       
    },

    airportCreated: function(airport) {

        if(airport.latitude == null || airport.longitude == null){
            return;
        }

        var arr = $.grep(this.airportPoints, function(points){
            return (airport.latitude == points.latitude && airport.longitude == points.longitude);
        });
        if(arr.length > 0){
            // console.log("exists");
            return true;
        }else{
            // console.log("create new airport");
            var newAirport = {
                latitude: airport.latitude,
                longitude: airport.longitude
            }
            this.airportPoints.push(newAirport);
            return false;
        }

    },

    getCategory: function(categoryName){
        
        if(categoryName == null){
            return;
        }
        // console.log("categories", this.categories);
        var arr = $.grep(this.categories, function(category){
            return categoryName === category.name;
        });
        // console.log(arr);

        if(arr.length > 0){

            return arr[0];
        }else{
            var newCategory = {
                name: categoryName,
                color: new THREE.Color(this.getRandomColor())
            }

            this.categories.push(newCategory);
            return newCategory;
        }

    },

    getRandomColor: function() {
        var letters = '789ABC'.split('');
        var color = '0x';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 5)];
        }
        return parseInt(color, 16);
    },

    createPath: function(vT, vF, dist, category){

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

        var material;
        if(category != null){
            material = new THREE.LineBasicMaterial({ color: category.color, transparent: true, });
        }else{
            // material = this.pathMaterial;
            material = new THREE.LineBasicMaterial({ color: 0xadedff, transparent: true});
        }

        var curveObject = new THREE.Line(pathGeometry, material);
        this.paths.push(curve);
        this.scene.add(curveObject);
        this.moObjects.push(curveObject);

        return curveObject;
    },

    createAirplaneMesh: function(speed, point, category){

        //TODO avoid creating same airport that already exists.
        
        //airplane 3D object
        var material;
        if(category != null){
            material = new THREE.MeshBasicMaterial({ color: category.color });
        }else{
            material = this.airplaneMaterial;
        }

        airplaneInstance = new THREE.Mesh(this.airplaneGeometry, material);

        // airplane object for controlling the scene actors
        // it's got the 3D object, it's speed and current location
        var airplane = [ airplaneInstance, (3 - speed) / 500, 0 ];

        //gets the path first position
        airplaneInstance.position.copy(point);        

        this.createdAirplaness.push(airplane);
        this.scene.add(airplaneInstance);

    },

    createAirportMesh: function(airport, category) {

        var material;
        if(category != null){
            material = new THREE.MeshPhongMaterial({ color: category.color });
        }else{
            material = this.airportMaterial;
        }

        // this is for object airports
        var airportInstance = new THREE.Mesh(this.airportGeometry, material);
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
