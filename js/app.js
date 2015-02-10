var scene;
var stats;
var renderer;
var camera;
var globe;
var container;
var controls;
var i = 0;
var spikes = []; // array of spike objects
var cities = []; // array of cities names meshes
var population_array = []; // array of population meshes
var INTERSECTED;

var data;

init();
drawGlobe();
addCamera();
addLight();
addControls();
requestData();

// data set from http://www.geonames.org/CA/largest-cities-in-canada.html

//addAxisHelper();



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
    dirLight.position.set(-100, 100, 100);
    dirLight.target = globe;

    //scene.add(ambLight);
    camera.add(dirLight);

}

function addControls() {

    controls = new THREE.OrbitControls(camera, container);
    controls.minDistance = 75;
    controls.maxDistance = 150;
    controls.userPan = false;

}

function addSpikes(data, callback) {

    var dataRecordIndex;
    for (dataRecordIndex in data) {
        var dataRecord = data[dataRecordIndex];
        var height = dataRecord.population / 100000;
        var geometry = new THREE.BoxGeometry(0.5, height, 0.5);
        var material = new THREE.MeshPhongMaterial({
            ambient: 0xff0000,
            color: 0xff0000,
        });
        var spike = new THREE.Mesh(geometry, material);

        spike.index = i++;

        spikes.push(spike);

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

        var cityname = new THREEx.Text(dataRecord.city);
        var population = new THREEx.Text(dataRecord.population);

        cities.push(cityname);
        population_array.push(population);

        globe.add(cityname);
        globe.add( population );

        cityname.visible = false;
        population.visible = false;

        cityname.position.copy(spike.position);
        population.position.copy(spike.position);
        population.position.y += height/2;
        cityname.position.y += height/2 + 2;
    }

    callback();
}

function addAxisHelper() {

    //if (scope.axishelp === false) return;

    var axes = new THREE.AxisHelper(200);
    axes.position.set(0, 0, 0);
    globe.add(axes);

}

function hoverOn(event) {


    var x = event.clientX;
    var y = event.clientY;

    x -= container.offsetLeft;
    y -= container.offsetTop;

    var vector = new THREE.Vector3((x / container.offsetWidth) * 2 - 1, -(y / container.offsetHeight) * 2 + 1, 0.5);

    vector.unproject(camera);

    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects = ray.intersectObjects(spikes); // returns an object in any intersected on click

    if (intersects.length > 0) {

        //console.log(data[intersects[0].object.index].city);

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) {

                INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
                cities[INTERSECTED.index].visible = false;
                population_array[INTERSECTED.index].visible = false;


                // 	for ( var k = 0; k < 50; k++ ) {
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
            INTERSECTED.index = intersects[0].object.index;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xCC00FF);

            cities[INTERSECTED.index].visible = true;
            population_array[INTERSECTED.index].visible = true;

        }
    }
}

function requestData() {

 $.ajax({ // this request for availability of suites
            type: 'GET',
            url: 'data/data.json',
            dataType: 'json',
            success: function( json ) {

                data = json.cities;

               addSpikes(data, function() {

    container.addEventListener('mousemove', hoverOn, false);
    render();
});
            },
            cache: false, // sometimes old info stuck in cache
            error: function() {
                console.log('An error occurred while processing a data file.');
            }
        });

}