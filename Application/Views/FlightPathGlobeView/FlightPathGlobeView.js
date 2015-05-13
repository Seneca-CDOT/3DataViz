/**
** @author Bruno Di Giuseppe / smokingcobra.com
**/
var Application = Application || {};

Application.FlightPathGlobeView = Application.BaseTextureGlobeView.extend({

// *************************
    initialize: function() {
        Application.BaseTextureGlobeView.prototype.initialize.call(this);
        this.intersects;

        // FUN FUN FUN
        this.party = false;


        //variables used to set the size of the objects and camera/controls orientation
        this.cylinderRadius = this.globeRadius * 0.0085;
        this.cylinderHeight = this.globeRadius / 500;


        // in case you want to use sprites, they look terrible and there's
        // no gain in performance, so I'm sticking with objects

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


        // this is where I set up all the objects. Later on, I just instantiate them
        // with different positions/ rotations. This is the main improvement so far, 
        // performance wise

        this.airportGeometry = new THREE.SphereGeometry( this.cylinderRadius, 8, 8 );
        this.blueMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff, side: THREE.DoubleSide} );
       
        this.pathMaterial = new THREE.LineBasicMaterial( { 
            color : 0xff0000,
            transparent: true,
            opacity: .5,
        } );

        this.airplaneGeometry = new THREE.TetrahedronGeometry(this.cylinderRadius);
        this.airplaneMaterial  = new THREE.MeshBasicMaterial( {color:0xa4c800} );

        // Here I listen for collection entries to know when they are loaded. 
        // I don't really think I need it anymore, let me check...
        // I think it is needed, so.... yeah. You do need it.
        this.collection[0].bind("add", this.dataReady, this);
        this.collection[1].bind("add", this.dataReady, this);

        // Simple, fetch the collections
        this.collection[1].fetch();
        this.collection[0].fetch();

        // HexMap is the map for clicking on countries.
        // TextureMap is the actual thing that's shown
        this.hexMap = 'Assets/Images/textures/hexMapMin.png';
        this.textureMap = 'Assets/Images/textures/worldMatrix.jpg';

        // Arrays for controlling the scene actors
        this.airports = [];
        this.routes = [];
        this.createdAirports = [];
        this.movingGuys = [];

        // this is for generating the texture. with factor 3 you'll get a 9k X 3k texture
        this.factor = 3;
        this.texHeight = 1024 * this.factor;
        this.texWidth = this.texHeight * this.factor;

        //this is the canvas size and its attributes.
        this.tw = this.th = 1024;

        this.canvas, this.canvasCtx;

        //getting country's centre variables
        this.maxLon = maxLat = -180;
        this.minLon = minLat =  180;
        this.avgLon = avgLat =    0;
        this.dist            =    0;
        this.midPoint;

        this.moved = false

        //time factor for animations
        this.t = 0;
    },
    render: function() {

        Application.BaseTextureGlobeView.prototype.render.call(this);
        return this;
    },
    // data ready checks to see if both csv's have loaded. if so,
    // start drawing the paths
    dataReady: function( dataId ){

        if( this.collection[0].parsed && this.collection[1].parsed ){
            this.addPaths();
        }
    },
    showGlobe: function() {

        Application.BaseTextureGlobeView.prototype.showGlobe.call(this);
    },
    initGlobe: function() {

        Application.BaseTextureGlobeView.prototype.initGlobe.call(this);

        // start stuff used to do more stuff, like drawing the texture ant stuff.
        // as of now, it just calls the setUpCanvas() function.
        this.startStuff();

        // This are the functions for drawing the textures.
        // it works like this: readCountries() is going to read 
        // each and every country from that huge countries file and then
        // pass it to addBorders2() with a color to draw it on the canvas.
        // Canvas needs to be set up before hand.

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

        Application.BaseTextureGlobeView.prototype.renderGlobe.call(this);
    }, 
    addGlobe: function() {

        Application.BaseTextureGlobeView.prototype.addGlobe.call(this);

        var texture = THREE.ImageUtils.loadTexture( this.textureMap );
        var material = new THREE.MeshBasicMaterial({
                                color: 0xFFFFFF,
                                map: texture
                            });

        if (this.globe.material != null) {

            this.globe.material.dispose();
            this.globe.material = null;
        }
        this.globe.material = material;
    },
    updateGlobe: function() {


        //this is going to move the airplanes around the world.
        // First we check to see if there are paths and planes
        // second, we iterate through the airplanes list
        // then we check to see if the path is finished or not
        // then black magic and things move.
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

        // TODO: ERMARGERD SO MUCH FUN 
        if(this.party){

        }

        Application.BaseTextureGlobeView.prototype.updateGlobe.call(this);
    },
    //sets up canvas and loads hexMap for pixel clicking functionality
    setUpCanvas: function (tex){

        this.canvas = document.createElement('canvas');
        this.canvas.backgrounColor = "0x000000";

        this.canvasCtx = this.canvas.getContext("2d");

        var image = new Image();
        image.src = tex;
        image.onload = (function(that) {

            return function() {

                // draw the image on the 'canvas'
                that.canvasCtx.drawImage(image, 0, 0);
            };
        })(this);

        this.canvas.width  = this.tw;
        this.canvas.height = this.th;
    },
    // gives you a random number within a range
    getRandomInt: function(min, max) {

        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    //this is going to add the airports to the list and instantiate them to the scene.
    addAirport: function( airport ){
        // this is for object airports
        var airportInstance = new THREE.Mesh( this.airportGeometry, this.blueMaterial );
        airportInstance.rotation.y = airport.latitude * Math.PI / 180;

        var xRotationSign = airport.latitude + 90 > 90 ? -1 : 1;
        airportInstance.rotation.x = xRotationSign * (90 - airport.longitude) * Math.PI / 180;

        // this is for spirtes.
        // var airportInstance = new THREE.Sprite(this.airportSpriteMaterial);

        airportInstance.position.copy(airport.position3D);

        this.createdAirports.push(airport.ID);

        this.scene.add( airportInstance );
    },
    // checks to see if the airport has been created
    airportCreated: function(id){

        for( var i = 0; i < this.createdAirports.length; i++ ){
            if(this.createdAirports[i] == id){
                return true;
                break;
            }
        }
        return false;
    },
    // returns an airport from with a given ID
    getAirport: function(id){
        for ( i in this.collection[0].models )
            if( id == this.collection[0].models[i].attributes.ID )
                return this.collection[0].models[i].attributes;
    },
    // core function of the application. THIS IS WHERE THE MAGIC HAPPENS
    addPaths: function () {
        var i = 0
        var dataRecord;
        var randomIndex;

        var routes = this.collection[1].models;
        var srcAirport;
        var destAirport;
        var time = 100;
        var that = this;

        //let's iterate through all the routes
        for ( dataRecordIndex in routes ) {
            time = time + 10;
            ++i;
            //but let's take only the first 100, so we don't burn the computer
            if(i > 1000) break;          
            // time out is going to give it an interval between 
            // instantiating each route
            setTimeout(function() {
                // get a random route
                randomIndex = that.getRandomInt(1, 65000);
                dataRecord = routes[ randomIndex ].attributes;

                // get destination and source airports for the chosen route
                srcAirport = that.getAirport(dataRecord.sourceAirport);
                destAirport = that.getAirport(dataRecord.destinationAirport);

                //sets up the vector points for the airports
                var vT = srcAirport.position3D;
                var vF = destAirport.position3D;

                // let's check if the airport object has been instantiated already
                if( !that.airportCreated( srcAirport.ID ) ){
                    that.addAirport( srcAirport );
                }
                if( !that.airportCreated( destAirport.ID ) ){
                    that.addAirport( destAirport );
                }

                //gets the distance between the points. Maxium = 2*radius
                var dist = vF.distanceTo(vT);

                // get the control points' vectors
                var cvT = vT.clone();
                var cvF = vF.clone();

                // some mathmagic
                var xC = ( 0.5 * (vF.x + vT.x) );
                var yC = ( 0.5 * (vF.y + vT.y) );
                var zC = ( 0.5 * (vF.z + vT.z) );

                var mid = new THREE.Vector3(xC, yC, zC);

                var smoothDist = Application.Helper.map(dist, 0, 10, 0, 15/dist);

                mid.setLength( that.globeRadius * smoothDist );

                cvT.add(mid);
                cvF.add(mid);

                cvT.setLength( that.globeRadius * smoothDist );
                cvF.setLength( that.globeRadius * smoothDist );

                //create the bezier curve
                var pathGeometry = new THREE.Geometry();
                var curve = new THREE.CubicBezierCurve3( vF, cvF, cvT, vT );

                // this sets the number of vertices on the paths,
                // their resolution, how good they look.
                // the smaller the number, the squarer it'll look
                pathGeometry.vertices = curve.getPoints( 15 );

                // Create the final Object3d to add to the this.scene

                var curveObject = new THREE.Line( pathGeometry, that.pathMaterial );
                paths.push(curve);
                that.scene.add(curveObject);

                var speed = Application.Helper.map(dist, 0, that.globeRadius*2, 0, 2.9);
                
                //airplane sprite
                // var airplaneInstance = new THREE.Sprite(that.airplaneSpriteMaterial);
                
                //airplane 3D object
                var airplaneInstance  = new THREE.Mesh(that.airplaneGeometry, that.airplaneMaterial);

                // airplane object for controlling the scene actors
                // it's got the 3D object, it's speed and current location
                var airplane = [
                    airplaneInstance,
                    (3 - speed) / 500,
                    0
                ];
                
                // finally we add the airplane to the array 
                // that'll keep track of everything
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
        this.setUpCanvas( this.hexMap );
    },

    // interaction
    clickOn: function(event) {

        Application.BaseTextureGlobeView.prototype.clickOn.call(this, event);

        // TODO: flight path globe functionality

        // var point = intersects[0].point;
        // point.setLength(radius);

        // var color = Application.Helper.getPixelClicked(point, canvasCtx)
        // var country = Application.Helper.getCountryById(color);
        // if(country)
        //     this.cameraGoTo(country);
    }
});