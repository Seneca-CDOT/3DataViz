// View

var GlobeView = Backbone.View.extend({
    render: function() {
        // TODO: call 'render' from here
    },

    initGlobe: function() {

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
        var countriesmeshes = []; // array of country meshes for intersection purposes
        var ctr = 0; // number of shapes
        var midpoints = [];
        var orbitOn = false;
        var list = [];
        var socket = null;

        var geodata; // stores data about countries

        init();
        drawGlobe();
        addCamera();
        addLight();
        addControls();
        requestCountriesData().done(function(result) {
            addCountries(result, render);
        });
        // addAxisHelper();


        function init() {

            container = document.createElement('div');
            document.body.appendChild(container);

            socket = io('http://localhost:7777');

            scene = new THREE.Scene();

            addStats();

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });

            $( container ).append('<form><input type="text" id="country" ' + 'style="position:absolute;top:50px;right:50px;font-size:30px;opacity:0.7;"></form>');
            $( container ).append('<button type="button" id="tweets" style="position:absolute;bottom:100px;right:50px;width: 200px;height: 50px">Tweets</button>');
            $( container ).append('<button type="button" id="reset" style="position:absolute;bottom:50px;right:50px;width: 200px;height: 50px">Reset</button>');

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
                shininess: 20
            });
            globe = new THREE.Mesh(geometry, material);
            scene.add(globe);
            globe.name = 'globe';
            countries['globe'] = globe;
            countriesmeshes.push(globe);
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
            controls.minDistance = 55;
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

            var intersects = ray.intersectObjects(countriesmeshes); // returns an object in any intersected on click


            if (intersects.length > 0) {

                if (intersects[0].object.name == 'globe') return; // exclude invisible meshes from intersection

                cameraGoTo(intersects[0].object.name);

            }
        }

        function requestCountriesData() {

            return $.ajax({
                type: 'GET',
                url: '../../Resources/Data/geodata.json',
                dataType: 'json',
                cache: false, // sometimes old info stuck in cache
                error: function() {
                    console.log('An error occurred while processing a countries file.');
                }
            });

        }

        function requestPopulationData() {

            return $.ajax({
                type: 'GET',
                url: 'data/data.json',
                dataType: 'json',
                cache: false, // sometimes old info stuck in cache
                error: function() {
                    console.log('An error occurred while processing a data file.');
                }
            });

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

            var x = r * Math.sin(the) * Math.sin(phi) * -1;
            var z = r * Math.cos(the) * Math.sin(phi);
            var y = r * Math.cos(phi);

            return new THREE.Vector3(x, y, z);


        }

        var ctr = 0;

        function addBorders(coordinates, name) {

            //var country = data.features[0].geometry.coordinates[0];

            if (coordinates[0].length !== 2) {

                for (var i = 0; i < coordinates.length; i++) {

                    addBorders(coordinates[i], name);

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

                var countrycolor = rgbToHex(10, i++, 0);

                material = new THREE.MeshPhongMaterial({
                    shininess: 0,
                    color: countrycolor
                });
                geometry = new Map3DGeometry(data[name], 0);
                // midpoints.push({
                //     countryname: name,
                //     lon: data[name].vertices[0],
                //     lat: data[name].vertices[1]
                // });
                data[name].mesh = new THREE.Mesh(geometry, material);
                scene.add(data[name].mesh);
                // scale = Math.random()/2 + 50.5;
                scale = 50.5;
                data[name].mesh.scale.set(scale, scale, scale);
                data[name].mesh.geometry.computeBoundingSphere();
                data[name].mesh.name = name;
                data[name].mesh.used = false;
                data[name].mesh.countrycolor = countrycolor;
                countries[data[name].code] = data[name].mesh;
                countriesmeshes.push(data[name].mesh);
            }
            callback();

        }

        function readCountries(data, callback) {

            for (var i = 0; i < data.features.length; i++) {

                addBorders(data.features[i].geometry.coordinates, data.features[i].properties.NAME);

            }

            //  console.log(ctr + " shapes were generated");
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

        function cameraGoTo(countryname) {

            document.removeEventListener('mouseup', onMouseUp, false);
            moved = true;
            controls.removeMouse();

            var countrymesh = findCountryMeshByName(countryname);

            if (countrymesh === undefined) {

                $('.cityname').empty();
                var cityname = '<div class="cityname" style="position:absolute;top:150px;right:50px;color:white;font-size:30px;opacity:0.7;">' + "Not found" + '</div>';
                $('#webgl').append(cityname);
                return;

            }

            var current = controls.getPosition();

            //   for (var i = 0; i < countries.length; i++) {

            //   if (countries[i].name == country) {

            //var midpoint = getMidPoint( geodata[ countryname] );
            //var destination =  geoToxyz( midpoint.lon, midpoint.lat );
            // var destination = geoToxyz(camerapoints[i].lon, camerapoints[i].lat);
            // var countrymesh = findCountryMeshByName( countryname );
            var destination = countrymesh.geometry.boundingSphere.center.clone();
            destination.setLength(controls.getRadius());
            //     break;
            //  }

            //  }
            highlightCountry(countrymesh);

            //    console.dir( current, destination );

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
                    document.addEventListener('mouseup', onMouseUp, false);
                    controls.addMouse();
                });

            orbitOn = true;
            tween.start();

        }


        function findCountryMeshByName(name) {

            for (var i = 0; i < countriesmeshes.length; i++) {


                if (countriesmeshes[i].name.toLowerCase() == name.toLowerCase()) {

                    return countriesmeshes[i];
                }
            }

        }

        function findCountryMeshByCode(code) {

            return countries[code];
        }

        function highlightCountry(object) {

            if (INTERSECTED != object) {

                if (INTERSECTED) {

                    INTERSECTED.material.color.setHex(INTERSECTED.currentColor); // for countries shapes
                }
                INTERSECTED = object;
                INTERSECTED.currentColor = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex(0x0000FF);
                $('.cityname').empty();
                var cityname = '<div class="cityname" style="position:absolute;top:150px;right:50px;color:white;font-size:30px;opacity:0.7;">' + INTERSECTED.name + '</div>';
                $('#webgl').append(cityname);

            }
        }


// Event listeners to distinguish a move and a click
var moved = false;

function onMouseUp( e ) {

 if (!moved) {

    clickOn(e); 
}

moved = false;
};

function onMouseMove( e ) {

    if (e.which == 1) {
    moved = true;
}
};

document.addEventListener('mousemove', onMouseMove, false);
document.addEventListener('mouseup', onMouseUp, false);

// End of move and click event listeners section
        

        $(document).on("keyup", 'form', function(e) {
            var code = e.keyCode || e.which;

            if (code !== 13) {
                var name = $('#country').val();
                showList(name);
            }
        });

        $(document).on("keypress", function(e) {
            var code = e.keyCode || e.which;

            if (code == 13) {
                e.preventDefault();
                $('#cityname').empty();
                var name = $('#country').val();
                cameraGoTo(name);
                $('.list').empty();

            }
        });

        $('#tweets').on("click", function(e) {
            
            getTweets();

        });

         $('#reset').on("click", function(e) {
            
            resetCountriesColor();

        });


        function showList(name) {

            if (name == '') $('.list').empty();

            for (var j = 0; j < countriesmeshes.length; j++) {

                if (name.charAt(0) == countriesmeshes[j].name[0].toLowerCase()) {

                    list.push(countriesmeshes[j].name);

                }

            }

            $('.list').empty();
            var countrylist = '<div class="list" style="position:absolute;top:250px;right:50px;color:white;font-size:30px;opacity:0.7;">';
            for (var x = 0; x < list.length; x++) {

                countrylist += list[x] + '<br>';
            }

            countrylist += '</div>';
            $('#webgl').append(countrylist);

            list = [];
        }

        function drawStar(name) {

            var countrymesh = findCountryMeshByName(name);

            var position = countrymesh.geometry.boundingSphere.center.clone().setLength(60);

            var star = new THREE.Shape();

            star.moveTo(.5, .0);
            star.lineTo(.625, .4);
            star.lineTo(1., .4);
            star.lineTo(.69, .625);
            star.lineTo(.8, 1.);
            star.lineTo(.5, .775);
            star.lineTo(.2, 1.);
            star.lineTo(.31, .625);
            star.lineTo(.0, .4);
            star.lineTo(.375, .4);

            var extrudeSettings = {
                amount: .5,
                steps: 1,
                bevelSegments: 0,
                bevelSize: 0,
                bevelThickness: 0
            };

            var extruded = new THREE.ExtrudeGeometry(star, extrudeSettings);


            var mesh = new THREE.Mesh(extruded, new THREE.MeshPhongMaterial({
                color: 0xff0000,
                side: THREE.DoubleSide
            }));

            scene.add(mesh);
            //mesh.scale.set( 0.5, 0.5, 0.5 );

            var objectNormal = new THREE.Vector3(0, 0, 1);

            var direction = new THREE.Vector3(position.x, position.y, position.z);
            direction.normalize();

            var angle = Math.acos(direction.z);
            var axis = new THREE.Vector3();
            axis.crossVectors(objectNormal, direction);
            axis.normalize();

            var quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

            mesh.rotation.setFromQuaternion(quaternion);
            mesh.position.copy(position);


        }

        function drawAmount(array, callback) {

            var step = 100 / array.length;
            var total = 0;
            // var index = 0;
             array.sort(function(a, b){return b.total_tweets-a.total_tweets});
             // var loop = setInterval(function() {

           $.each( array, function(index, country) {

                // console.log(index);
                var countrymesh = findCountryMeshByCode(array[index]._id.code);
                // var countrymesh = findCountryMeshByCode(country._id.code);

                if (typeof countrymesh === 'undefined') {

                    console.log("Missing country " + array[index]._id.country + " from globe dataset");
                    //index++;
                    return;
                }

                countrymesh.used = true;

               if ( index < 10 ) {

                var position = countrymesh.geometry.boundingSphere.center.clone().setLength(51);

                var number = new THREEx.Text(index+1);

                scene.add(number);

                var objectNormal = new THREE.Vector3(0, 0, 1);

                var direction = new THREE.Vector3(position.x, position.y, position.z);
                direction.normalize();

                var angle = Math.acos(direction.z);
                var axis = new THREE.Vector3();
                axis.crossVectors(objectNormal, direction);
                axis.normalize();

                var quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

                number.rotation.setFromQuaternion(quaternion);
                number.position.copy(position);

            }

                // $("#webgl").empty();
                // $('#webgl').append("<div style='position:absolute;top:200px;left:500px;color:white;font-size: 30px'>" + parseInt(step++) + "</div>");
                console.log( parseInt(total += step) + '%');
                
                if (index == array.length - 1) {
                    // $("#webgl").empty();
                    console.log('100%');
                    callback();
                }
               
            //   index++;
          //  }, 100);
});

        }

        function getTweets() {

            socket.emit('countries');
            socket.on('result', function(result) {

                console.dir(result);
                drawAmount(result, hideUnusedCountries);
            });
        }

        function hideUnusedCountries() {

          $.each( countriesmeshes, function (index, value ) {

            if ( countriesmeshes[index].used == false ) {
                
                countriesmeshes[index].material.color.set( 0x62626C );

            }

          });

        }

        function resetCountriesColor() {

 $.each( countriesmeshes, function (index, value ) {

                           if ( countriesmeshes[index].name !== 'globe') {
                countriesmeshes[index].material.color.set( countriesmeshes[index].countrycolor );
            }

          });


        }

    },
    showGlobe: function(data) {
        this.initGlobe();
    }
});