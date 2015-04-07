/**
 * @author Bruno Di Giuseppe / smokingcobra.com
 */

var Application = Application || {};

Application.FlightPathGlobeView = Application.BaseGlobeView.extend({

// *************************
    initialize: function() {
        Application.BaseGlobeView.prototype.initialize.call(this);
        this.intersects;

        this.hexMap = 'Assets/images/textures/hexMapMin.png';
        this.textureMap = 'Assets/images/textures/worldMatrix.jpg';

        this.imgTex;
        this.radius = 50;

        this.airports = [];
        this.routes = [];

        this.factor = 3;
        this.texHeight = 1024 * this.factor;
        this.texWidth = this.texHeight * this.factor;

        this.tw = this.th = 1024;

        this.parsed1 = false;
        this.parsed2 = false;

        this.canvas, this.canvasCtx;

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
        this.renderGlobe2();
        return this;
    },
    renderGlobe2: function(){
        Application.BaseGlobeView.prototype.renderGlobe.call(this);
        requestAnimationFrame(this.renderGlobe2.bind(this));

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
    },

    showGlobe: function() {
        Application.BaseGlobeView.prototype.showGlobe.call(this);
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

        document.body.appendChild(canvas);
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
            if( typeof x.data[2] == "number" ){
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
    readCSV: function(file, callback){
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
            }
        };
        Papa.parse(file, config);
    },
    readCSV2: function(file, callback, callback2){
        var s = this.scene;
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
                callback2(s);
            }
        };
        Papa.parse(file, config);
        this.scene = s;
    },

    addPaths: function (data) {
        var dataRecordIndex;

        for ( dataRecordIndex in data ) {
    
            var dataRecord = data[dataRecordIndex];
            var phiFrom = dataRecord.from.lat * Math.PI / 180;
            var thetaFrom = (dataRecord.from.lon + 90) * Math.PI / 180;
            
            // console.log(dataRecord);
            //calculates "from" point
            var xF = this.radius * Math.cos(phiFrom) * Math.sin(thetaFrom);
            var yF = this.radius * Math.sin(phiFrom);
            var zF = this.radius * Math.cos(phiFrom) * Math.cos(thetaFrom);

            var phiTo   =  dataRecord.to.lat * Math.PI / 180;
            var thetaTo = (dataRecord.to.lon + 90) * Math.PI / 180;

            //calculates "to" point
            var xT = this.radius * Math.cos(phiTo) * Math.sin(thetaTo);
            var yT = this.radius * Math.sin(phiTo);
            var zT = this.radius * Math.cos(phiTo) * Math.cos(thetaTo);

            //Sets up vectors
            var vT = new THREE.Vector3(xT, yT, zT);
            var vF = new THREE.Vector3(xF, yF, zF);

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

            var material2 = new THREE.LineBasicMaterial( { color : 0xff0000 } );

            // Create the final Object3d to add to the this.scene
            var curveObject = new THREE.Line( geometry2, material2 );
            paths.push(curve);

            this.scene.add(curveObject);

            var cylinderRadius = this.radius * 0.01;
            var cylinderHeight = this.radius / 500;

            //Create cylinder to reperesent "From" city
            // TODO: create airports prior to creating airlines
            //Using the real flight data it doesn't seem like a good idea create  a airport point
            // for every path, for now I'll just disable.
            // So, for now:
            var createCylinders = false;
            if(createCylinders){
                var geometry = new THREE.CylinderGeometry( cylinderRadius, cylinderRadius, cylinderHeight, 32 );
                var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
                var cylinderFrom = new THREE.Mesh( geometry, material );

                fromPoints.push(cylinderFrom);

                cylinderFrom.position.copy(vF);

                cylinderFrom.rotation.y = dataRecord.from.lon * Math.PI / 180;

                var xRotationSign = dataRecord.from.lon + 90 > 90 ? -1 : 1;
                cylinderFrom.rotation.x = xRotationSign * (90 - dataRecord.from.lat) * Math.PI / 180;

                this.scene.add( cylinderFrom );

                //Create cylinder to reperesent "To" city
                var cylinderTo = new THREE.Mesh( geometry, material );

                toPoints.push(cylinderTo);

                cylinderTo.position.copy(vT);

                cylinderTo.rotation.y = dataRecord.to.lon * Math.PI / 180;

                xRotationSign = dataRecord.to.lon + 90 > 90 ? -1 : 1;
                cylinderTo.rotation.x = xRotationSign * (90 - dataRecord.to.lat) * Math.PI / 180;

                this.scene.add( cylinderTo );
            }
            //Create Shpere to follow along the path
            geometry  = new THREE.SphereGeometry(cylinderRadius * 2, 32, 32);
            material  = new THREE.MeshBasicMaterial( {color:0xff00000} );
            var sphere  = new THREE.Mesh(geometry, material);

            movingGuys.push(sphere);
            //gets the path first position
            sphere.position.copy(curve.getPoint(0));
            this.scene.add(sphere);
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
        this.addPaths( dataSetPath );
        // this.s = this.scene;

        // this.readCSV( pathAirports, this.getAirports );
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

        
    }
});