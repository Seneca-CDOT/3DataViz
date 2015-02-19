var scene;
var stats;
var renderer;
var canvas;
var camera;
var globe;
var container;
var controls;

var sphere;
var radius = 50;
var galaxyRadius = radius * 10;

var paths = [];
var fromPoints = [];
var toPoints = [];
var movingGuys = [];

var t = 0;

var dataSet = [{
    trip: 121,
    from:
    {   city: "Beijing",
        population: 2600000,
        lat: 39.913,
        lon: 116.391
    },
    to:{
        city: "Toronto",
        population: 2600000,
        lat: 43.7,
        lon: -79.416
    }
},
{
    trip: 122,
    from:
    {   city: "Ottawa",
        population: 812129,
        lat: 45.411,
        lon: -75.698
    },
    to:
    {   city: "Vancouver",
        population: 1837969,
        lat: 49.25,
        lon: -123.119
    },
    value: 6
},
{
    trip: 125,
    from:
    {   city: "Moscow",
        population: 812129,
        lat: 55.750,
        lon: 37.616
    },
    to:
    {   city: "Cape Town",
        population: 1837969,
        lat: -33.925,
        lon: 18.423
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "Kiev",
        population: 812129,
        lat: 50.450,
        lon: 30.523
    },
    to:
    {   city: "Amsterdam",
        population: 1837969,
        lat: 52.366,
        lon: 4.900
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "London",
        population: 812129,
        lat: 51.507,
        lon: 0.127
    },
    to:
    {   city: "Pakistan",
        population: 1837969,
        lat: 33.666,
        lon: 73.166
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "Sydney",
        population: 812129,
        lat: -33.860,
        lon: 151.209
    },
    to:
    {   city: "Havana",
        population: 1837969,
        lat: 23.133,
        lon: -82.383
    },
    value: 4
},
{
    trip: 123,
    from:
        {   city: "Sao Paulo",
            lat: -23.550,
            lon: -46.633
        },
    to:
        {   city: "Scarborough",
            population: 600000,
            lat: 43.772,
            lon: -79.257
        },
    value: 5
}];


init();
drawGlobe();
addCamera();
addLight();
addControls();
addPaths(dataSet);

// data set from http://www.geonames.org/CA/largest-cities-in-canada.html

// addAxisHelper();
render();


function init() {

    container = document.createElement('div');
    document.body.appendChild(container);


    scene = new THREE.Scene();

    //stats; 

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

}

function drawGlobe() {

    var geometry = new THREE.SphereGeometry(radius, 128, 128);

    //var texture = THREE.ImageUtils.loadTexture('textures/earth.jpg');
    //var specmap = THREE.ImageUtils.loadTexture('textures/specular.jpg');


    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        ambient: 0xffffff,
        //map: texture,
        //specularMap: specmap,
        // shininess: 20,
    });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

}

function render() {

    requestAnimationFrame(render);

    globe.rotation.y += 0.0001;

    controls.update();

    // if (scope.statshelp === true) stats.update();

    renderer.render(scene, camera);
    for( var i = 0; i < movingGuys.length; i ++ ) {
          pt = paths[i].getPoint( t );
          movingGuys[i].position.set( pt.x, pt.y, pt.z );          
    }
    t = (t >= 1) ? 0 : t += 0.005;

}


function addCamera(pos) { // adds a camera

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 100;

    if (pos) {

        camera.position.z = pos.z;
        camera.position.y = pos.y;
        camera.position.x = pos.x;

    }

    scene.add(camera);


    //  var help = new THREE.DirectionalLightHelper(directionalLight, 10);

    //scene.add( help );

}

function onWindowResize() {

    // windowHalfX = window.innerWidth / 2;
    // windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

window.addEventListener('resize', onWindowResize, false);

function addLight() {

    // var ambLight = new THREE.AmbientLight(0xFFFFFF);
    var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set( 100,100,100 );
    dirLight.target = globe;

    //scene.add(ambLight);
    camera.add(dirLight);

}

function addControls() {

    controls = new THREE.OrbitControls(camera, canvas);
    controls.minDistance = 75;
    controls.maxDistance = 150;
    controls.userPan = false;

}

function map( x,  in_min,  in_max,  out_min,  out_max){
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

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

function addAxisHelper() {

    //if (scope.axishelp === false) return;

    var axes = new THREE.AxisHelper(200);
    axes.position.set(0, 0, 0);
    globe.add(axes);

}