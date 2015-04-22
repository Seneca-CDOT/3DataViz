/**
** @author Bruno Di Giuseppe / smokingcobra.com
**/
var Application = Application || {};

Application.FlightPathGlobeView = Application.BaseGlobeView.extend({

// *************************
    initialize: function() {
        Application.BaseGlobeView.prototype.initialize.call(this);
        this.intersects;

        this.party = false;

        this.radius = 50;
        this.cylinderRadius = this.radius * 0.0085;
        this.cylinderHeight = this.radius / 500;


        // var airplaneSpriteTex = THREE.ImageUtils.loadTexture("Assets/images/airplane.png");

        // this.airplaneSpriteMaterial = new THREE.SpriteMaterial({
        //    map: airplaneSpriteTex,
        //    // color: 0xffffff,
        //    fog: true
        // });

        // var airportSpriteTex = THREE.ImageUtils.loadTexture("Assets/images/airport.png");

        // this.airportSpriteMaterial = new THREE.SpriteMaterial({
        //    map: airportSpriteTex,
        //    // color: 0xffffff,
        //    fog: true
        // });

        this.airportGeometry = new THREE.SphereGeometry( this.cylinderRadius, 8, 8 );
        this.blueMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide} );
       
        this.pathMaterial = new THREE.LineBasicMaterial( { 
            color : 0xff0000,
            transparent: true,
            opacity: .5,
        } );

        this.airplaneGeometry = new THREE.TetrahedronGeometry(this.cylinderRadius);
        this.airplaneMaterial  = new THREE.MeshBasicMaterial( {color:0xa4c800} );

        this.collection[0].bind("add", this.dataReady, this);
        this.collection[1].bind("add", this.dataReady, this);


        this.collection[1].fetch();
        this.collection[0].fetch();

        this.hexMap = 'Assets/images/textures/hexMapMin.png';
        this.textureMap = 'Assets/images/textures/worldMatrix.jpg';

        this.imgTex;

        this.airports = [];
        this.routes = [];
        this.createdAirports = [];
        this.movingGuys = [];

        this.factor = 3;
        this.texHeight = 1024 * this.factor;
        this.texWidth = this.texHeight * this.factor;

        this.tw = this.th = 1024;

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

        // $(document).on("keyup", 'form', function(e) {
            
        // });

        $(document).on("keypress", function(e) {
            if(e.keyCode == 32){
                console.log(e.keyCode);
            }
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
            for( var i = 0; i < this.movingGuys.length; i ++ ) {
                if( this.movingGuys[i][2] >= 1 ){
                    this.movingGuys[i][2] = 0;
                }else{
                    this.movingGuys[i][2] += this.movingGuys[i][1]
                }

                (this.t >= 1) ? this.t=0 : this.t += 0.005;

                pt = paths[i].getPoint( this.movingGuys[i][2] );
                this.movingGuys[i][0].position.set( pt.x, pt.y, pt.z );  
            }
        }

        if(this.party){

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
    getRandomInt: function(min, max) {

        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    addAirport: function( airport ){
        var airportInstance = new THREE.Mesh( this.airportGeometry, this.blueMaterial );
        // var airportInstance = new THREE.Sprite(this.airportSpriteMaterial);


        airportInstance.position.copy(airport.position3D);

        airportInstance.rotation.y = airport.latitude * Math.PI / 180;

        var xRotationSign = airport.latitude + 90 > 90 ? -1 : 1;
        airportInstance.rotation.x = xRotationSign * (90 - airport.longitude) * Math.PI / 180;

        this.createdAirports.push(airport.ID);

        this.scene.add( airportInstance );
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
    getAirport: function(id){
        for ( i in this.collection[0].models )
            if( id == this.collection[0].models[i].attributes.ID )
                return this.collection[0].models[i].attributes;
    },
    addPaths: function () {
        var i = 0
        var dataRecord;
        var randomIndex;

        var routes = this.collection[1].models;
        var srcAirport;
        var destAirport;
        var time = 100;
        var that = this;

        for ( dataRecordIndex in routes ) {
            time = time + 10;
            ++i;
            if(i > 1000) break;            
            setTimeout(function() {

                randomIndex = that.getRandomInt(1, 65000);
                dataRecord = routes[ randomIndex ].attributes;

                srcAirport = that.getAirport(dataRecord.sourceAirport);
                destAirport = that.getAirport(dataRecord.destinationAirport);

                var vT = srcAirport.position3D;
                var vF = destAirport.position3D;

                if( !that.airportCreated( srcAirport.ID ) ){
                    that.addAirport( srcAirport );
                }
                if( !that.airportCreated( destAirport.ID ) ){
                    that.addAirport( destAirport );
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

                mid.setLength( that.radius * smoothDist );

                cvT.add(mid);
                cvF.add(mid);

                cvT.setLength( that.radius * smoothDist );
                cvF.setLength( that.radius * smoothDist );

                //create the bezier curve
                var pathGeometry = new THREE.Geometry();
                var curve = new THREE.CubicBezierCurve3( vF, cvF, cvT, vT );

                pathGeometry.vertices = curve.getPoints( 15 );

                // Create the final Object3d to add to the this.scene

                var curveObject = new THREE.Line( pathGeometry, that.pathMaterial );
                paths.push(curve);
                that.scene.add(curveObject);

                var speed = Application.Helper.map(dist, 0, that.radius*2, 0, 2.9);
                
                // var airplaneInstance = new THREE.Sprite(that.airplaneSpriteMaterial);
                
                var airplaneInstance  = new THREE.Mesh(that.airplaneGeometry, that.airplaneMaterial);
                var airplane = [
                    airplaneInstance,
                    (3 - speed) / 500,
                    0
                ];
        
                that.movingGuys.push(airplane);
                //gets the path first position
                airplaneInstance.position.copy(curve.getPoint(0));
                that.scene.add(airplaneInstance);
            }, time );
        }
    },
    startStuff: function(){
        //generates textures
        // readCountries(dataSet);
        // this.drawGlobe( this.textureMap );
        this.setUpCanvas( this.hexMap );
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