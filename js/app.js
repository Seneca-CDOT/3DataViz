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

var geodata; // stores data about countries

init();
drawGlobe();
addCamera();
addLight();
addControls();
requestData();
//render();

// data set from http://www.geonames.org/CA/largest-cities-in-canada.html

// addAxisHelper();



function init() {

    container = document.createElement('div');
    document.body.appendChild(container);


    scene = new THREE.Scene();

    addStats();

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

    var geometry = new THREE.SphereGeometry(50, 64, 64);

    //var texture = THREE.ImageUtils.loadTexture('textures/earth.jpg');
    //var specmap = THREE.ImageUtils.loadTexture('textures/specular.jpg');


    var material = new THREE.MeshPhongMaterial({
        color: 0x4396E8,
        ambient: 0x4396E8,
        //map: texture,
        //specularMap: specmap,
        shininess: 20,
    });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globe.name = 'globe';
    countries.push(globe);
}

function render() {

    requestAnimationFrame(render);

    stats.begin();

    if (orbitOn === true) {
        TWEEN.update();
    }

    //globe.rotation.y += 0.0001;

    controls.update();

    stats.end();
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

    // scene.add(ambLight);
    camera.add(dirLight);

}

function addControls() {

    controls = new THREE.OrbitControls(camera, container);
    controls.minDistance = 0;
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
        globe.add(population);

        cityname.visible = false;
        population.visible = false;

        cityname.position.copy(spike.position);
        population.position.copy(spike.position);
        population.position.y += height / 2;
        cityname.position.y += height / 2 + 2;
    }

    callback();
}

function addAxisHelper() {

    //if (scope.axishelp === false) return;

    var axes = new THREE.AxisHelper(200);
    axes.position.set(0, 0, 0);
    globe.add(axes);

}

function clickOn(event) {


    var x = event.clientX;
    var y = event.clientY;

    x -= container.offsetLeft;
    y -= container.offsetTop;

    var vector = new THREE.Vector3((x / container.offsetWidth) * 2 - 1, -(y / container.offsetHeight) * 2 + 1, 0.5);

    vector.unproject(camera);

    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects = ray.intersectObjects(countries); // returns an object in any intersected on click


    if (intersects.length > 0) {

        if (intersects[0].object.name == 'globe') return; // exclude invisible meshes from intersection

        //console.log(data[intersects[0].object.index].city);

        cameraGoTo( intersects[0].object.name );

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) {

                // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);// for spikes
                INTERSECTED.material.color.setHex(INTERSECTED.currentColor); // for countries shapes
                INTERSECTED.scale.x -= 0.5;
                INTERSECTED.scale.y -= 0.5;
                INTERSECTED.scale.z -= 0.5;
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
            INTERSECTED.scale.x += 0.5;
            INTERSECTED.scale.y += 0.5;
            INTERSECTED.scale.z += 0.5;
            console.log(INTERSECTED.direction);
            $('#webgl').empty();
            var cityname = '<div style="position:absolute;top:50px;right:50px;color:white;font-size:30px;opacity:0.7;">' + INTERSECTED.name + '</div>';
            $('#webgl').append(cityname);

            //cities[INTERSECTED.index].visible = true; // for spikes
            //population_array[INTERSECTED.index].visible = true; // for spikes

        }
    }
}

function requestData() {

    // $.ajax({ 
    //     type: 'GET',
    //     url: 'data/data.json',
    //     dataType: 'json',
    //     success: function(json) {

    //         data = json.cities;

    //         //                addSpikes(data, function() {

    //         //     container.addEventListener('mousemove', hoverOn, false);
    //         //     render();
    //         // });
    //     },
    //     cache: false, // sometimes old info stuck in cache
    //     error: function() {
    //         console.log('An error occurred while processing a data file.');
    //     }
    // });

    $.ajax({ 
        type: 'GET',
        url: 'data/geodata.json',
        dataType: 'json',
        success: function(json) {

            geodata = json;
            addCountries(json, function() {

                container.addEventListener('mousedown', clickOn, false);
                render();

            });


        },
        cache: false, // sometimes old info stuck in cache
        error: function() {
            console.log('An error occurred while processing a countries file.');
        }
    });

}

function addBorders(data) {

    var country = data.features[0].geometry.coordinates[0];

    var i, k, dot, verty = [];
    var border = new THREE.Shape();

    dot = geoToxyz(country[0][0], country[0][1]);
    border.moveTo(dot.x, dot.z);


    for (i = 1; i < country.length; i++) {

        dot = geoToxyz(country[i][0], country[i][1]);

        border.lineTo(dot.x, dot.z);
        verty.push(dot.y);

    }

    var rectGeom = new THREE.ShapeGeometry(border);

    var extrudeSettings = {
        amount: 1,
        steps: 1,
        bevelSegments: 0,
        bevelSize: 0,
        bevelThickness: 0
    };

    //var rectGeom = new THREE.ExtrudeGeometry(border, extrudeSettings);


    var rectMesh = new THREE.Mesh(rectGeom, new THREE.MeshPhongMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide
    }));

    globe.add(rectMesh);

    rectMesh.position.set(30, 30, 30);

    var xRotationSign = country[0][1] + 90 > 90 ? -1 : 1;
    // rectMesh.rotation.x = xRotationSign * (90 - country[0][0]) * Math.PI / 180;

    //rectMesh.rotation.y = -Math.PI / 2;
    rectMesh.scale.set(50, 50, 50);
    rectMesh.name = 'countryShape';

    var geom = rectMesh.geometry;


    geom.dynamic = true;

    for (var k = 0; k < geom.vertices.length; k++) {

        geom.vertices[k].y = 26;

    }
    geom.verticesNeedUpdate = true;


}

function geoToxyz(lon, lat, r) {

    var r = r || 1;

    // var phi = lat * Math.PI / 180;
    // var theta = (lon + 90) * Math.PI / 180;

    // var x = r * Math.cos(phi) * Math.sin(theta);
    // var y = r * Math.sin(phi);
    // var z = r * Math.cos(phi) * Math.cos(theta);

    var phi = +(90 - lat) * 0.01745329252;
    var the = +(180 - lon) * 0.01745329252;

    var x = r * Math.sin (the) * Math.sin (phi) * -1;
    var z = r * Math.cos (the) * Math.sin (phi);
    var y = r * Math.cos (phi);

    return new THREE.Vector3(x, y, z);


}

var ctr = 0;

function addBorders2(coordinates, name) {

    //var country = data.features[0].geometry.coordinates[0];

    if (coordinates[0].length !== 2) {

        for (var i = 0; i < coordinates.length; i++) {

            addBorders2(coordinates[i], name);

        }
        return;
    }


    var point;

    var geometry = new THREE.Geometry();

    for (var k = 0; k < coordinates.length; k++) {

        point = geoToxyz(coordinates[k][0], coordinates[k][1], 50);
        geometry.vertices.push(point);

    }

    var material = new THREE.LineBasicMaterial({
        color: 0x000000
    });


    var shape = new THREE.Line(geometry, material);
    globe.add(shape);
    shape.name = name;
    countries.push(shape);
    ctr++;

    //line.scale.set(50,50,50);

}

function addCountries(data, callback) {


    var i = 10,
        geometry, material, scale;

    for (var name in data) {

        material = new THREE.MeshPhongMaterial({
            shininess: 0,
            color: rgbToHex(10, i++, 0)
        });
        geometry = new Map3DGeometry(data[name], 0);
        midpoints.push({
            countryname: name,
            lon: data[name].vertices[0],
            lat: data[name].vertices[1]
        });
        data[name].mesh = new THREE.Mesh(geometry, material);
        scene.add(data[name].mesh);
        // scale = Math.random()/2 + 50.5;
        scale = 50.5;
        data[name].mesh.scale.set(scale, scale, scale);
        data[name].mesh.geometry.computeBoundingSphere();
        data[name].mesh.name = name;
        countries.push(data[name].mesh);
    }
      callback();

}

function readCountries(data, callback) {

    for (var i = 0; i < data.features.length; i++) {

        addBorders2(data.features[i].geometry.coordinates, data.features[i].properties.NAME);

    }

    console.log(ctr + " shapes were generated");
    callback();

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

function getMidPoint( country ) {

var lon = [];
var lat = [];

// var longitude = country.vertices[0];
// var isInEastHemisphere = (longitude > 0 && longitude < 180)
// var isInWestHemisphere = (longitude < 0 && longitude > -180)

for ( var i = 0; i+1 < country.vertices.length; i=i+2 ) {
    lon.push( country.vertices[i] );
    lat.push( country.vertices[i+1] );
}

var lonmax = Math.max.apply(Math,lon); 
var lonmin = Math.min.apply(Math,lon);
var lonmid = ( lonmin + lonmax ) / 2;

var latmax = Math.max.apply(Math,lat); 
var latmin = Math.min.apply(Math,lat);
var latmid = ( latmin + latmax ) / 2;

console.log( lonmid, latmid );

return { lon: lonmid, lat: latmid }

}


container.addEventListener('dblclick', clickOn, false);