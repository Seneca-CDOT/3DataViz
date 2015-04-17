/**
** @author Bruno Di Giuseppe / smokingcobra.com
**/
var Application = Application || {};

Application.FlightPathGlobeView = Application.BaseGlobeView.extend({

// *************************
    initialize: function() {
        Application.BaseGlobeView.prototype.initialize.call(this);
        this.intersects;

        this.collection[0].bind("add", this.dataReady, this);
        this.collection[1].bind("add", this.dataReady, this);

        this.collection[1].fetch( {
            success: function(r){
                // console.log("success Routes", r);
            },
            error: function(e){
                // console.log("error " , e);
            },
        });

        this.collection[0].fetch( {
            success: function(a){
                // console.log("success Airports", a);
            },
            error: function(e){
                // console.log("error " , e);
            }
        });

        this.hexMap = 'Assets/images/textures/hexMapMin.png';
        this.textureMap = 'Assets/images/textures/worldMatrix.jpg';

        this.imgTex;
        this.radius = 50;

        this.airports = [];
        this.routes = [];
        this.createdAirports = [];
        this.movingGuys = [];

        this.factor = 3;
        this.texHeight = 1024 * this.factor;
        this.texWidth = this.texHeight * this.factor;

        this.tw = this.th = 1024;

        this.canvas, this.canvasCtx;


        this.cylinderRadius = this.radius * 0.01;
        this.cylinderHeight = this.radius / 500;

        //getting country's centre variables
        this.maxLon = maxLat = -180;
        this.minLon = minLat =  180;
        this.avgLon = avgLat =    0;
        this.dist            =    0;
        this.midPoint;

        this.moved = false

        this.t = 0;
    },
    render: function() {
        Application.BaseGlobeView.prototype.render.call(this);
        // this.renderGlobe2();
        return this;
    },
    dataReady: function( dataId ){
        if( this.collection[0].parsed && this.collection[1].parsed ){
            this.addPaths();
        }
    },
    showGlobe: function() {

        Application.BaseGlobeView.prototype.showGlobe.call(this);
    },
    initGlobe: function() {
        Application.BaseGlobeView.prototype.initGlobe.call(this);
        this.startStuff();

        function onMouseUp(e) {
            if (!this.moved) {
               this.clickOn(e);
            }
            this.moved = false;
        };

        function onMouseMove(e) {
            if (e.which == 1) {
                this.moved = true;
            }
        };
        
        window.addEventListener('resize', this.onWindowResize, false);
        document.addEventListener('mousemove', onMouseMove.bind(this), false);
        document.addEventListener('mouseup', onMouseUp.bind(this), false);

        $(document).on("keyup", 'form', function(e) {
            
        });

        $(document).on("keypress", function(e) {

        });

        function addBorders2(coordinates, name, color) {

            //var country = data.features[0].geometry.coordinates[0];

            if (coordinates[0].length !== 2) {

                for (var i = 0; i < coordinates.length; i++) {

                    addBorders2(coordinates[i], name, color);

                }
                return;
            }

            var point;

            this.canvasCtx.beginPath();
            this.canvasCtx.lineWidth = "2";
            this.canvasCtx.strokeStyle = "#00f100";

            point = Application.Helper.geoToxy(coordinates[0][0], coordinates[0][1]);

            this.canvasCtx.moveTo(point.x, point.y);

            maxLon = maxLat = -180;
            minLon = minLat =  180;
            avgLon = avgLat =    0;
            dist            =    0;

            var k;
            for ( k = 1; k < coordinates.length; k++) {

                if(coordinates[k][0] > maxLon) maxLon = coordinates[k][0];
                if(coordinates[k][0] < minLon) minLon = coordinates[k][0];

                if(coordinates[k][1] > maxLat) maxLat = coordinates[k][1];
                if(coordinates[k][1] < minLat) minLat = coordinates[k][1];


                point = Application.Helper.geoToxy(coordinates[k][0], coordinates[k][1]);

                this.canvasCtx.lineTo(point.x, point.y);
            }

            dist = +(maxLat - minLat) + +(maxLon - minLon);
            avgLat = ( maxLat + minLat ) / 2;
            avgLon = ( maxLon + minLon ) / 2;

            midPoint = Application.Helper.geoToxyz(avgLon, avgLat);

            this.canvasCtx.stroke();  // Draw it
            // this.canvasCtx.fillStyle = "#000000";
            this.canvasCtx.fillStyle = "#" + color;

            this.canvasCtx.fill();
        }

        function readCountries(data) {
            var r = 00;
            var g = 128;
            var b = 00;

            var threshold = 'b0';

            // var hr, hb,hg;
            // var hg = '55';

            var color = 0;
            console.log("'type' : 'countryColorTable',");
            console.log("'elements' : [");
            var i = 0
            var nameC;
            for (; i < data[0].features.length; i++) {

                color = Application.Helper.decToHex(r) + Application.Helper.decToHex(g) + Application.Helper.decToHex(b);

                r = ( r > 100? r = 0 : r );
                g = ( g > 250? g = 0 : g );
                b = ( b > 110? b = 0 : b );

                if(b > parseInt(threshold, 16)){
                    g = ((b % 8 == 0)? ++g : g );
                    b++;
                }else{
                    r = ((b % 16 == 0)? ++r : r );
                    b++;
                }
                nameC = data[0].features[i].properties.NAME;
                console.log("  {");
                console.log("  'color' : '" + color + "',");
                console.log("  'country' : '" + nameC + "',");

                addBorders2(data[0].features[i].geometry.coordinates, data[0].features[i].properties.NAME, color);

                console.log( "  'countrySize' : " + dist + "," );
                console.log( "  'midPoint' : {" );
                console.log( "    'x' : " + midPoint.x + ", " );
                console.log( "    'y' : " + midPoint.y + ", " );
                console.log( "    'z' : " + midPoint.z + ", " );
                console.log( "  }" );

                console.log(( i == data[0].features.length - 1 ) ? " }" : " },");
            }
            console.log("]");
            console.log("}");
        }   
    },
    renderGlobe: function() {

        Application.BaseGlobeView.prototype.renderGlobe.call(this);
    }, 
    addGlobe: function() {
        // Application.BaseGlobeView.prototype.addGlobe.call(this);

        var geometry = new THREE.SphereGeometry(this.radius, 64, 64);

        var texture = THREE.ImageUtils.loadTexture( this.textureMap );

        var material = new THREE.MeshBasicMaterial({
                                color: 0xFFFFFF,
                                map: texture
                            });
        this.globe = new THREE.Mesh(geometry, material);

        this.globe.userData.name = 'globe';
        this.globe.userData.code = '';
        this.scene.add(this.globe);     
    },
    updateGlobe: function() {

        if (this.orbitOn === true) {

            TWEEN.update();
        }

        if( typeof(movingGuys) !== "undefined" &&
            typeof(paths)      !== "undefined"
             ){
            for( var i = 0; i < movingGuys.length; i ++ ) {
                      pt = paths[i].getPoint( this.t );
                      movingGuys[i].position.set( pt.x, pt.y, pt.z );
                }
                this.t = (this.t >= 1) ? 0 : this.t += 0.005;
        }

        Application.BaseGlobeView.prototype.updateGlobe.call(this);
    },
    //sets up canvas and loads hexMap for pixel clicking functionality
    setUpCanvas: function (tex){

        canvas = document.createElement('canvas');
        canvas.backgrounColor = "0x000000";

        canvasCtx = canvas.getContext("2d");

        var image = new Image();
        image.onload = function () {
            canvasCtx.drawImage(image, 0, 0); // draw the image on the canvas
        }
        image.src = tex;

        canvas.width  = this.tw;
        canvas.height = this.th;
    },
    getAirports: function(data){
        //raw:
        //x.data[i][0] ID
        //x.data[i][1] Airport
        //x.data[i][2] City
        //x.data[i][3] Country
        //x.data[i][6] Lat
        //x.data[i][7] Lon

        //parsed:
        //airports[i][0] ID
        //airports[i][1] Airport
        //airports[i][2] City
        //airports[i][3] Country
        //airports[i][4] Lat
        //airports[i][5] Lon
        //airports[i][6] ThreeJS.Vector3
        var x = data;
        var d = [];
        this.parsed1 = false;
        for( var i = 0 ; i < x.data.length ; i++ ){
            var tempAir = [
                x.data[i][0],
                x.data[i][1],
                x.data[i][2],
                x.data[i][3],
                x.data[i][6],
                x.data[i][7],
                Application.Helper.geoToxyz(x.data[i][6], x.data[i][7], this.radius)
            ];
            d.push(tempAir);
        }
        this.airports = d;
        this.parsed1 = true;
    },
    getRoutes: function(data){

        //x.data[i][0] route ID
        //x.data[i][3] source Airport id
        //x.data[i][5] destination airport id
        //x.data[i][7] stops
        //x.data[i][8] equipment

        //routes[i][0] route ID
        //routes[i][1] source Airport id
        //routes[i][2] destination airport id
        //routes[i][3] stops
        //routes[i][4] equipment


        this.parsed2 = false
        var x = data;
        var d = [];
       for( var i = 0 ; i < x.data.length ; i++ ){
            if( x.data[i][5] != "\\N" && 
                x.data[i][3] != "\\N" &&
                x.data[i][1] != "\\N" 
             ){
                var tempAir = [
                    x.data[i][0],
                    x.data[i][3],
                    x.data[i][5],
                    x.data[i][7],
                    x.data[i][8],
                ];
                d.push(tempAir);
            }
        }
        this.routes = d;
        this.parsed2 = true;
    },
    readCSV: function(file, callback, callback2){
        var that = self = this;
        this.parsed = false;
        var config = {
            delimiter : ",",
            newline : "",
            header: false,
            dynamicTyping: true,
            preview: undefined,
            encoding: "",
            worker: false,
            comments: false,
            step: undefined,
            // complete: undefined,
            error: undefined,
            download: true,
            skipEmptyLines: false,
            chunk: undefined,
            fastMode: true,
            complete: function(d) {
                callback(d);
                if ( parsed1 && parsed2 ) {
                    callback2().bind(that);
                }
            }
        };
        Papa.parse(file, config);
    },

    getRandomInt: function(min, max) {

        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    addAirport: function(id){
        airport = this.collection[0].models[id].attributes;

        var geometry = new THREE.CylinderGeometry( this.cylinderRadius, this.cylinderRadius, this.cylinderHeight, 4 );
        var material = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide} );
        var cylinderFrom = new THREE.Mesh( geometry, material );

        cylinderFrom.position.copy(airport[6]);

        cylinderFrom.rotation.y = airport[5] * Math.PI / 180;

        var xRotationSign = airport[5] + 90 > 90 ? -1 : 1;
        cylinderFrom.rotation.x = xRotationSign * (90 - airport[4]) * Math.PI / 180;

        this.createdAirports.push(id);

        this.scene.add( cylinderFrom );
    },

    airportCreated: function(id){
        for( var i = 0; i < this.createdAirports.length; i++ ){
            if(this.createdAirports[i] == id){
                return true;
                break;
            }
        }
        return false;
    },

    addPaths: function () {
        var i = 0
        var dataRecord;
        var randomIndex;

        var routes = this.collection[1].models;
        var airports = this.collection[0].models;

        for ( dataRecordIndex in routes.length ) {
            ++i;
            if(i > 700) break;            

            randomIndex = this.getRandomInt(1, 65000);
            dataRecord = routes[ randomIndex ].attributes;

            var vT = airports[ dataRecord[2] ].attributes[6];
            var vF = airports[ dataRecord[1] ].attributes[6];

            if( !self.airportCreated( airports[dataRecord[1].attributes][0] ) ){
                self.addAirport( airports[dataRecord[1]].attributes[0] );
            }
            if( !self.airportCreated( airports[dataRecord[2]].attributes[0]) ){
                self.addAirport( airports[dataRecord[2]].attributes[0] );
            }

            //gets the distance between the points. Maxium = 2*radius
            var dist = vF.distanceTo(vT);

            //create
            var cvT = vT.clone();
            var cvF = vF.clone();

            var xC = ( 0.5 * (vF.x + vT.x) );
            var yC = ( 0.5 * (vF.y + vT.y) );
            var zC = ( 0.5 * (vF.z + vT.z) );

            var mid = new THREE.Vector3(xC, yC, zC);

            var smoothDist = Application.Helper.map(dist, 0, 10, 0, 15/dist);

            mid.setLength( this.radius * smoothDist  );

            cvT.add(mid);
            cvF.add(mid);

            cvT.setLength( this.radius * smoothDist );
            cvF.setLength( this.radius * smoothDist );

            //create the bezier curve
            var curve = new THREE.CubicBezierCurve3( vF, cvF, cvT, vT );

            var geometry2 = new THREE.Geometry();
            geometry2.vertices = curve.getPoints( 50 );

            var material2 = new THREE.LineBasicMaterial( { 
                color : 0xff0000,
                transparent: true,
                opacity: .5,
             } );

            // Create the final Object3d to add to the this.scene
            var curveObject = new THREE.Line( geometry2, material2 );
            paths.push(curve);

            self.scene.add(curveObject);

            var speed = Application.Helper.map(dist, 0, 10, 0, 2.9);

            geometry  = new THREE.TetrahedronGeometry(self.cylinderRadius);
            material  = new THREE.MeshBasicMaterial( {color:0xa4c800} );
            var sphere  = new THREE.Mesh(geometry, material);
            var airplane = [
                sphere,
                (3 - speed) / 500,
                0
            ];
    
            self.movingGuys.push(airplane);
            //gets the path first position
            sphere.position.copy(curve.getPoint(0));
            self.scene.add(sphere);
        }
    },
    startStuff: function(){
        //generates textures
        // readCountries(dataSet);
        // this.drawGlobe( this.textureMap );
        var server       = "http://zenit.senecac.on.ca/~int322_142a07/cdot/bb/ver2/Application/Models/data/";
        var fileAirports = "airports.csv";
        var fileRoutes   = "routes.csv";

        var pathAirports = server + fileAirports;
        var pathRoutes   = server + fileRoutes;
        
        this.setUpCanvas( this.hexMap );
        // this.addPaths( dataSetPath );
        // this.s = this.scene;

        // this.readCSV( pathAirports, this.getAirports, null );
        // this.readCSV( pathRoutes, this.getRoutes, this.addPaths );
        // this.readCSV2( pathRoutes, this.getRoutes, this.addPaths );

    },
    cameraGoTo: function(country) {

        // document.removeEventListener('mouseup', onMouseUp, false);
        // this.controls.removeMouse();
        
        this.moved = true;

        var current = this.controls.getPosition();
        var destination = new THREE.Vector3(country.midPoint.x, country.midPoint.y, -1 * country.midPoint.z);
        destination.setLength(this.controls.getRadius());

        if (this.orbitOn == true) {
            this.tween.stop();
        }

        this.tween = new TWEEN.Tween(current)
        .to({
            x: destination.x,
            y: destination.y,
            z: destination.z
        }, 1000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate((function(that) { 
            return function () { 
                onUpdate(this, that); 
            };
        })(this))
        .onComplete((function(that) { 
            return function () { 
                onComplete(this, that); 
            };
        })(this));

        function onUpdate(point, that) {
            that.controls.updateView({
                x: point.x,
                y: point.y,
                z: point.z
            });
        }

        function onComplete(point, that) {
            that.orbitOn = false;
        }

        this.orbitOn = true;
        this.tween.start();
    },
    onWindowResize: function() {

        Application.BaseGlobeView.prototype.onWindowResize()
    },
    clickOn: function(event) {
        var x = event.clientX;
        var y = event.clientY;

        x -= this.container.offsetLeft;
        y -= this.container.offsetTop;

        var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);

        vector.unproject(this.camera);

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

        intersects = ray.intersectObject(this.globe); // returns an object in any intersected on click

        if (intersects.length > 0) {

            if (intersects[0].object.name == 'globe') return; // exclude invisible meshes from intersection

            var place = intersects[0].point;
            place.setLength(radius);

            var color = Application.Helper.getPixelClicked(place, canvasCtx)

            var country = Application.Helper.getCountryById(color);
            if(country)
                this.cameraGoTo(country);
        }
    },

});