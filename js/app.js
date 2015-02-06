var scene;
var stats;
var renderer;
var canvas;
var camera;
var globe;
var container;
var controls;

init();
drawGlobe();
addCamera();
addLight();
addControls();
addSpikes(
[
{   city: "Montreal",
    population: 3268513,
    lat: 45.509,
    lon: -73.558
},
{   city: "Toronto",
    population: 2600000,
    lat: 43.7,
    lon: -79.416
},
{   city: "Vancouver",
    population: 1837969,
    lat: 49.25,
    lon: -123.119
},
{   city: "Calgary",
    population: 1019942,
    lat: 51.05,
    lon: -114.085
},
{   city: "Ottawa",
    population: 812129,
    lat: 45.411,
    lon: -75.698
},
{   city: "Edmonton",
    population: 712391,
    lat: 53.55,
    lon: -113.469
},
{   city: "Mississauga",
    population: 668549,
    lat: 43.579,
    lon: -79.658
},
{   city: "North York",
    population: 636000,
    lat: 43.676,
    lon: -79.416
},
{   city: "Winnipeg",
    population: 632063,
    lat: 49.884,
    lon: -97.147
},
{   city: "Scarborough",
    population: 600000,
    lat: 43.772,
    lon: -79.257
}
]);

// data set from http://www.geonames.org/CA/largest-cities-in-canada.html

//addAxisHelper();
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

    var geometry = new THREE.SphereGeometry(50, 128, 128);

    var texture = THREE.ImageUtils.loadTexture('textures/earth.jpg');
    var specmap = THREE.ImageUtils.loadTexture('textures/specular.jpg');


    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        ambient: 0xffffff,
        map: texture,
        specularMap: specmap,
        shininess: 20,
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

    var ambLight = new THREE.AmbientLight(0xFFFFFF);
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

function addSpikes(data) {

var dataRecordIndex;
for (dataRecordIndex in data) {
	var dataRecord = data[dataRecordIndex];
	var height = dataRecord.population / 500000;
    var geometry = new THREE.CylinderGeometry(0.2, 0.2, height, 32);
    var material = new THREE.MeshPhongMaterial({
        ambient: 0x00ff00,
        color: 0x00ff00,
    });
    var spike = new THREE.Mesh(geometry, material);
    //spike.name = i++;

    globe.add(spike);
    


    var phi = dataRecord.lat * Math.PI / 180;
    var theta = (dataRecord.lon + 90) * Math.PI / 180;
    var radius = 50;

    var x = radius * Math.cos(phi) * Math.sin(theta);
    var y = radius * Math.sin(phi);
    var z = radius * Math.cos(phi) * Math.cos(theta);

    var vec = new THREE.Vector3(x, y, z);

    spike.position.copy(vec);

    spike.rotation.y = dataRecord.lon * Math.PI / 180;

    var xRotationSign = dataRecord.lon + 90 > 90 ? -1 : 1;
    spike.rotation.x = xRotationSign * (90 - dataRecord.lat) * Math.PI / 180;
} 
}

function addAxisHelper() {

    //if (scope.axishelp === false) return;

    var axes = new THREE.AxisHelper(200);
    axes.position.set(0, 0, 0);
    globe.add(axes);

}