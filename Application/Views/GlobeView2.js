var App = App || {};

App.GlobeView2 = Backbone.View.extend({
	tagName: "div",
    template: _.template($("#globeViewTemplate").html()),
    render: function(options) {
        this.showGlobe();
        return this;
    },

// *************************
 	showGlobe: function() {
        this.initGlobe();
    },
    initGlobe: function() {

        var intersects;
        var scene;
        var stats;
        var renderer;
        var camera;
        var globe;
        var container;
        var controls;
        var i = 0;
        var spikes = []; // an array of spike objects
        var cities = []; // an array of cities names meshes
        var population_array = []; // an array of population meshes
        var INTERSECTED;
        var countries = []; // an array of countries
        var ctr = 0; // number of shapes
        var midpoints = [];
        var orbitOn = false;

        var imgTex;
        var hexMap = '/Assets/images/textures/hexMapMin.png';
        var textureMap = '/Assets/images/textures/worldMatrix.png';

        var factor = 3;
        var texHeight = 1024 * factor;
        var texWidth = texHeight * factor;

        var tw = th = 1024;

        var canvas, canvasCtx;

        //getting country's centre variables
        var maxLon = maxLat = -180;
        var minLon = minLat =  180;
        var avgLon = avgLat =    0;
        var dist               = 0;
        var midPoint;

        var t = 0;
        var ctr = 0;

        init(this.options);
        startStuff();

        //Adding elements here
        container = this.$el[0];
        container.appendChild(renderer.domElement);
        container.style.position = "absolute";
        container.style.width = this.options.size.width;
        container.style.left = this.options.origin.x;

        function addPaths(data) {
          var dataRecordIndex;

          for (dataRecordIndex in data) {
            var dataRecord = data[dataRecordIndex];
            var phiFrom = dataRecord.from.lat * Math.PI / 180;
            var thetaFrom = (dataRecord.from.lon + 90) * Math.PI / 180;

            //calculates "from" point
            var xF = radius * Math.cos(phiFrom) * Math.sin(thetaFrom);
            var yF = radius * Math.sin(phiFrom);
            var zF = radius * Math.cos(phiFrom) * Math.cos(thetaFrom);

            var phiTo   =  dataRecord.to.lat * Math.PI / 180;
            var thetaTo = (dataRecord.to.lon + 90) * Math.PI / 180;

            //calculates "to" point
            var xT = radius * Math.cos(phiTo) * Math.sin(thetaTo);
            var yT = radius * Math.sin(phiTo);
            var zT = radius * Math.cos(phiTo) * Math.cos(thetaTo);

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

            var smoothDist = map(dist, 0, 10, 0, 15/dist );
            var dist2 = Math.pow(15/dist,2);

            mid.setLength( radius * smoothDist );

            cvT.add(mid);
            cvF.add(mid);

            cvT.setLength( radius * smoothDist );
            cvF.setLength( radius * smoothDist );

            //create the bezier curve
            var curve = new THREE.CubicBezierCurve3( vF, cvF, cvT, vT );

            var geometry2 = new THREE.Geometry();
            geometry2.vertices = curve.getPoints( 50 );

            var material2 = new THREE.LineBasicMaterial( { color : 0xff0000 } );

            // Create the final Object3d to add to the scene
            var curveObject = new THREE.Line( geometry2, material2 );
            paths.push(curve);
            scene.add(curveObject);


            var cylinderRadius = radius * 0.01;
            var cylinderHeight = radius / 500;

            //Create cylinder to reperesent "From" city
            var geometry = new THREE.CylinderGeometry( cylinderRadius, cylinderRadius, cylinderHeight, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
            var cylinderFrom = new THREE.Mesh( geometry, material );

            fromPoints.push(cylinderFrom);

            cylinderFrom.position.copy(vF);

            cylinderFrom.rotation.y = dataRecord.from.lon * Math.PI / 180;

            var xRotationSign = dataRecord.from.lon + 90 > 90 ? -1 : 1;
            cylinderFrom.rotation.x = xRotationSign * (90 - dataRecord.from.lat) * Math.PI / 180;

            scene.add( cylinderFrom );

            //Create cylinder to reperesent "To" city
            var cylinderTo = new THREE.Mesh( geometry, material );

            toPoints.push(cylinderTo);

            cylinderTo.position.copy(vT);

            cylinderTo.rotation.y = dataRecord.to.lon * Math.PI / 180;

            xRotationSign = dataRecord.to.lon + 90 > 90 ? -1 : 1;
            cylinderTo.rotation.x = xRotationSign * (90 - dataRecord.to.lat) * Math.PI / 180;

            scene.add( cylinderTo );

            //Create Shpere to follow along the path
            geometry  = new THREE.SphereGeometry(cylinderRadius * 2, 32, 32);
            material  = new THREE.MeshBasicMaterial( {color:0xff00000} );
            var sphere  = new THREE.Mesh(geometry, material);

            movingGuys.push(sphere);
            //gets the path first position
            sphere.position.copy(curve.getPoint(0));
            scene.add(sphere);

          }
        }


        function init() {

            // container = document.createElement('div');
            // document.body.appendChild(container);

            scene = new THREE.Scene();

            addStats();

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });

            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setClearColor(0x000);
            renderer.setSize(window.innerWidth, window.innerHeight);
            // container.appendChild(renderer.domElement);

        }
        //sets up canvas and loads hexMap for pixel clicking functionality
        function setUpCanvas(tex){

            canvas = document.createElement('canvas');
            canvas.backgrounCdolor = "0x000000";

            canvasCtx = canvas.getContext("2d");

            var image = new Image();

            image.onload = function () {
                canvasCtx.drawImage(image, 0, 0); // draw the image on the canvas
            }
            image.src = tex;

            canvas.width = tw;
            canvas.height = th;

            document.body.appendChild(canvas);
        }

        /* Moved */
        function drawGlobe(tex, hexMap) {

            var geometry = new THREE.SphereGeometry(radius, 64, 32);

            var texture = THREE.ImageUtils.loadTexture( tex );
            // texture.needsUpdate    = true;

            var material = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                ambient: 0xFFFFFF,
                map: texture,

                // specularMap: texture,
                // shininess: 50,
            });
            globe = new THREE.Mesh(geometry, material);
            globe.material.needsUpdate = true;
            scene.add(globe);

            setUpCanvas(hexMap);

            console.log(globe);
        }

        function render() {
            requestAnimationFrame(render);

            stats.begin();

            if (orbitOn === true) {
                    TWEEN.update();
                }

                controls.update();

                stats.end();
                renderer.render(scene, camera);
                for( var i = 0; i < movingGuys.length; i ++ ) {
                      pt = paths[i].getPoint( t );
                      movingGuys[i].position.set( pt.x, pt.y, pt.z );
                }
                t = (t >= 1) ? 0 : t += 0.005;
        }

        /* Moved */
        function addCamera(pos) { // adds a camera

            camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = radius * 4;

            if (pos) {

                camera.position.z = pos.z;
                camera.position.y = pos.y;
                camera.position.x = pos.x;

            }

            scene.add(camera);

        }

        /* Moved */
        function onWindowResize() {

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

        }
        window.addEventListener('resize', onWindowResize, false);

        /* Moved */
        function addLight() {

            var ambLight = new THREE.AmbientLight(0xFFFFFF, 2.5);
            var dirLight = new THREE.DirectionalLight(0xFFFFFF, 2.5);
            dirLight.position.set(-10, 10, 10);
            dirLight.target = globe;

            scene.add(ambLight);
            // camera.add(dirLight);

        }

        /* Moved */
        function addControls() {

            controls = new THREE.OrbitControls(camera, container);
            controls.minDistance = radius * 1.1;
            controls.maxDistance = radius * 7;
            controls.userPan = false;

        }

        function geoToxyz(lon, lat) {

            var r = radius || 1;

            // var phi = lat * Math.PI / 180;
            // var theta = (lon + 90) * Math.PI / 180;

            // var x = r * Math.cos(phi) * Math.sin(theta);
            // var y = r * Math.sin(phi);
            // var z = r * Math.cos(phi) * Math.cos(theta);

            var phi = +(90 - lat) * 0.01745329252;
            var the = +(180 - lon) * 0.01745329252;

            var z = r * Math.sin (the) * Math.sin (phi);
            var x = r * Math.cos (the) * Math.sin (phi) * -1;
            var y = r * Math.cos (phi);

            var v = new THREE.Vector3(x, y, z);

            return v ;
        }

        /*Beggining of click country*/
        function getPixelClicked(place, canvasContext){
            var x = place.x;
            var y = place.y;
            var z = place.z;

            var lat = Math.asin( y / radius) * (180/Math.PI); // LAT in radians
            var lon = Math.atan2(z, x) * (180/Math.PI) * -1; // LON in radians

            var p = geoToxy(lon,lat);

            var imageData = canvasContext.getImageData(p.x, p.y, 1, 1);
            var pixel = imageData.data;

            var r = pixel[0],
            g = pixel[1],
            b = pixel[2];

            var color = decToHex(r) + decToHex(g) + decToHex(b);

            return color;
        }

        function getCountryById(id){
            var country = countiresList[0].elements;
            if(id == '000000')
                return false;
            for(var i = 0 ; i < country.length; i++){
                if( country[i].id == id ){
                    return country[i];
                }
            }
        }

        function getCountryByName(name){
            var country = countiresList[0].elements;
            if(id == '')
                return false;
            for(var i = 0 ; i < country.length; i++){
                if( country[i].name == name ){
                    return country[i];
                }
            }
        }

        /* Moved */
        function geoToxy(lon, lat) {

            var r = r || 1;

            var x = 0;
            x = map(lon, -180, 180, 0, tw);

            var y = 0;
            y = map(-lat,-90,90,0, th);

            var z = 0;

            return new THREE.Vector3(x, y, z);
        }

        /* Moved */
        /*end of click country*/
        function clickOn(event) {


            var x = event.clientX;
            var y = event.clientY;

            x -= container.offsetLeft;
            y -= container.offsetTop;

            var vector = new THREE.Vector3((x / container.offsetWidth) * 2 - 1, -(y / container.offsetHeight) * 2 + 1, 0.5);

            vector.unproject(camera);

            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

            intersects = ray.intersectObject(globe); // returns an object in any intersected on click

            if (intersects.length > 0) {

                if (intersects[0].object.name == 'globe') return; // exclude invisible meshes from intersection

                var place = intersects[0].point;
                place.setLength(radius);

                var color = getPixelClicked(place, canvasCtx)

                var country = getCountryById(color);

                cameraGoTo(country);
            }
        }

        function startStuff(){
            //generates textures
            // readCountries(dataSet);
            addCamera();
            addControls();
            drawGlobe(textureMap, hexMap);
            addLight();
            // addPaths(dataSetPath);
            render();
        }

        function addBorders2(coordinates, name, color) {

            //var country = data.features[0].geometry.coordinates[0];

            if (coordinates[0].length !== 2) {

                for (var i = 0; i < coordinates.length; i++) {

                    addBorders2(coordinates[i], name, color);

                }
                return;
            }

            var point;

            canvasCtx.beginPath();
            canvasCtx.lineWidth = "2";
            canvasCtx.strokeStyle = "#00f100";

            point = geoToxy(coordinates[0][0], coordinates[0][1]);

            canvasCtx.moveTo(point.x, point.y);

            maxLon = maxLat = -180;
            minLon = minLat =  180;
            avgLon = avgLat =    0;
            dist               = 0;

            var k;
            for ( k = 1; k < coordinates.length; k++) {

                if(coordinates[k][0] > maxLon) maxLon = coordinates[k][0];
                if(coordinates[k][0] < minLon) minLon = coordinates[k][0];

                if(coordinates[k][1] > maxLat) maxLat = coordinates[k][1];
                if(coordinates[k][1] < minLat) minLat = coordinates[k][1];


                point = geoToxy(coordinates[k][0], coordinates[k][1]);

                canvasCtx.lineTo(point.x, point.y);
            }

            dist = +(maxLat - minLat) + +(maxLon - minLon);
            avgLat = ( maxLat + minLat ) / 2;
            avgLon = ( maxLon + minLon ) / 2;

            midPoint = geoToxyz(avgLon, avgLat);

            canvasCtx.stroke();  // Draw it
            // canvasCtx.fillStyle = "#000000";
            canvasCtx.fillStyle = "#" + color;

            canvasCtx.fill();
            ctr++;

        }

        /* Moved */
        function decToHex(c){
            var hc;
            if (c < 10){ hc = ( '0' + c.toString(16) ); }
            else if(c < 17){ hc = c.toString(16) + '0';}
            else{hc = c.toString(16);}
            return hc;
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

                color = decToHex(r) + decToHex(g) + decToHex(b);

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
            console.log(ctr + " shapes were generated");

        }

        /* Moved */
        function addStats() {

            stats = new Stats();
            stats.setMode(0); // 0: fps, 1: ms

            stats.domElement.style.position = 'absolute';
            stats.domElement.style.left = '0px';
            stats.domElement.style.top = '0px';

            document.body.appendChild(stats.domElement);

        }

        /* Moved */
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        /* Moved */
        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        }

        /* Moved */
        function cameraGoTo( c ) {

            var current = controls.getPosition();
            var country = c;
            if(country){
                var destination = new THREE.Vector3(country.midPoint.x, country.midPoint.y, -1 * country.midPoint.z);
                console.log(country);

                destination.setLength( ( radius * 2 ) );

                // console.dir( current, destination );

                if (orbitOn == true) {
                    tween.stop();
                }

                tween = new TWEEN.Tween(current)
                    .to({
                        x: destination.x,
                        y: destination.y,
                        z: destination.z
                    }, 1000)

                .easing(TWEEN.Easing.Sinusoidal.InOut)
                    .onUpdate(function() {

                        controls.updateView({
                            x: this.x,
                            y: this.y,
                            z: this.z
                        });

                    })
                    .onComplete(function() {
                        orbitOn = false;
                        console.log("stop");
                    });

                orbitOn = true;
                tween.start();
            }
        }
        container.addEventListener('dblclick', clickOn, false);
    }
});