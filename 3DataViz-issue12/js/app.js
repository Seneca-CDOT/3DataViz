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

var factor = 3;
var texHeight = 1024 * factor;
var texWidth = texHeight * factor;
var canvas, canvasCtx;

var t = 0;

var ctr = 0;

init();
addCamera();
addControls();
requestData2();

// data set from http://www.geonames.org/CA/largest-cities-in-canada.html

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

    container = document.createElement('div');
    document.body.appendChild(container);
    
    canvas = document.createElement('canvas');
    canvas.backgroundColor = "0x000000";
    canvas.width = texWidth;
    canvas.height = texHeight;

    //uncomment this line to see the texture at the bottom of the page
    // document.body.appendChild(canvas);

    canvasCtx = canvas.getContext("2d");
    canvasCtx.fillStyle   = "#000000";

    scene = new THREE.Scene();

    addStats();

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

}

function drawGlobe(tex) {

    var geometry = new THREE.SphereGeometry(radius, 64, 32);

    var texture = new THREE.Texture( tex );
    texture.needsUpdate    = true;

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

    console.log(globe);
}

function render() {
    requestAnimationFrame(render);

    stats.begin();


    controls.update();

    stats.end();
    renderer.render(scene, camera);
    for( var i = 0; i < movingGuys.length; i ++ ) {
          pt = paths[i].getPoint( t );
          movingGuys[i].position.set( pt.x, pt.y, pt.z );          
    }
    t = (t >= 1) ? 0 : t += 0.005;
}


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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener('resize', onWindowResize, false);

function addLight() {

    var ambLight = new THREE.AmbientLight(0xFFFFFF, 2.5);
    var dirLight = new THREE.DirectionalLight(0xFFFFFF, 2.5);
    dirLight.position.set(-10, 10, 10);
    dirLight.target = globe;

    scene.add(ambLight);
    // camera.add(dirLight);

}

function addControls() {

    controls = new THREE.OrbitControls(camera, container);
    controls.minDistance = radius * 1.1;
    controls.maxDistance = radius * 7;
    controls.userPan = false;

}

function clickOn(event) {


    var x = event.clientX;
    var y = event.clientY;

    x -= container.offsetLeft;
    y -= container.offsetTop;

    var vector = new THREE.Vector3((x / container.offsetWidth) * 2 - 1, -(y / container.offsetHeight) * 2 + 1, 0.5);

    vector.unproject(camera);

    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    intersects = ray.intersectObject(globe); // returns an object in any intersected on click

    // console.log(intersects.faces.);

    console.log("HEEEERE==================");

    if (intersects.length > 0) {

        if (intersects[0].object.name == 'globe') return; // exclude invisible meshes from intersection

        //console.log(data[intersects[0].object.index].city);

        // cameraGoTo( intersects[0].object.name );

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) {

                // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);// for spikes
                INTERSECTED.material.color.setHex(INTERSECTED.currentColor); // for countries shapes
                // INTERSECTED.scale.x -= 0.5;
                // INTERSECTED.scale.y -= 0.5;
                // INTERSECTED.scale.z -= 0.5;
                // cities[INTERSECTED.index].visible = false; // for spikes
                // population_array[INTERSECTED.index].visible = false;


                //  for ( var k = 0; k < 50; k++ ) {
                // INTERSECTED.geometry.dynamic = true;
                //                   INTERSECTED.geometry.vertices[0].y -= 0.1;
                //                   INTERSECTED.geometry.vertices[1].y -= 0.1;
                //                   INTERSECTED.geometry.vertices[4].y -= 0.1;
                //                   INTERSECTED.geometry.vertices[5].y -= 0.1;
                //                   INTERSECTED.geometry.verticesNeedUpdate = true;
                //               }

            }
            //console.log( intersects[ 0 ].object );
            INTERSECTED = intersects[0].object;
            // INTERSECTED.index = intersects[0].object.index; // for spikes
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex(); // for spikes
            INTERSECTED.currentColor = INTERSECTED.material.color.getHex();
            // INTERSECTED.material.emissive.setHex(0xCC00FF); // for spikes

            INTERSECTED.material.color.setHex(0x0000FF);

            // INTERSECTED.scale.x += 0.5;
            // INTERSECTED.scale.y += 0.5;
            // INTERSECTED.scale.z += 0.5;
            console.log(INTERSECTED.direction);
            $('#webgl').empty();
            var cityname = '<div style="position:absolute;top:50px;right:50px;color:white;font-size:30px;opacity:0.7;">' + INTERSECTED.name + '</div>';
            $('#webgl').append(cityname);

            //cities[INTERSECTED.index].visible = true; // for spikes
            //population_array[INTERSECTED.index].visible = true; // for spikes

        }
    }
}

function requestData2(){
    readCountries(dataSet);
    drawGlobe(canvas);
    addLight();
    // addPaths(dataSetPath);
    render();
}

function geoToxyz(lon, lat, r) {

    var r = r || 1;

    var x = 0;
    x = map(lon, -180, 180, 0, texWidth);

    var y = 0;
    y = map(-lat,-90,90,0,texHeight);

    var z = 0;

    return new THREE.Vector3(x, y, z);
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
    canvasCtx.lineWidth = "5";
    canvasCtx.strokeStyle = "#000";

    point = geoToxyz(coordinates[0][0], coordinates[0][1], radius);

    canvasCtx.moveTo(point.x, point.y);

    for (var k = 1; k < coordinates.length; k++) {

        point = geoToxyz(coordinates[k][0], coordinates[k][1], radius);

        canvasCtx.lineTo(point.x, point.y);
    }

    canvasCtx.stroke();  // Draw it
    // canvasCtx.fillStyle = "#003000";
    canvasCtx.fillStyle = "#" + color;

    canvasCtx.fill();
    ctr++;

}
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
    console.log("'elements' : ['");
    var i = 0
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
        console.log("{");
        console.log("'color' : '" + color + "',");
        console.log("'country' : '" + data[0].features[i].properties.NAME + "'");
        console.log(( i == data[0].features.length - 1 ) ? "}" : "},");
        // console.log('r : ' + r);
        // console.log('g : ' + g);
        // console.log('b : ' + b);


        addBorders2(data[0].features[i].geometry.coordinates, data[0].features[i].properties.NAME, color);
    }
    console.log("]");
    console.log("}");
    console.log(ctr + " shapes were generated");

}

function addStats() {

    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms 

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);

}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function cameraGoTo( countryname ) {

    var current = controls.getPosition();

 //   for (var i = 0; i < countries.length; i++) {

     //   if (countries[i].name == country) {
        
           var midpoint = getMidPoint( geodata[ countryname ] );
          var destination =  geoToxyz( midpoint.lon, midpoint.lat );
           // var destination = geoToxyz(camerapoints[i].lon, camerapoints[i].lat);
            destination.setLength( 100 );
        //     break;
      //  }

  //  }

    console.dir( current, destination );

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
 container.addEventListener('dblclick', clickOn, false);