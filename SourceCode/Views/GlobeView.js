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
        var ctr = 0; // number of shapes
        var orbitOn = false;
        var list = [];
        var socket;
        var twittermode = false;

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
            socket.on('result', function(result) {

                drawAmount(result, hideUnusedCountries);
            });

            scene = new THREE.Scene();

            addStats();

            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true
            });

            $(document.body).append('<form><input type="text" id="country" ' + 'style="position:absolute;top:50px;right:50px;font-size:30px;opacity:0.7;"></form>');
            $(document.body).append('<button type="button" id="tweets" style="position:absolute;bottom:100px;right:50px;width: 200px;height: 50px">Tweets</button>');
            $(document.body).append('<button type="button" id="reset" style="position:absolute;bottom:50px;right:50px;width: 200px;height: 50px">Reset</button>');

            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setClearColor(0x000000);
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

        }

        function drawGlobe() { // draw a globe

            var geometry = new THREE.SphereGeometry(50, 64, 64);

            var material = new THREE.MeshPhongMaterial({
                color: 0x4396E8,
                ambient: 0x4396E8,
                shininess: 20
            });
            globe = new THREE.Mesh(geometry, material);
            scene.add(globe);
            globe.userData.name = 'globe';
            globe.userData.code = '';
            countries.push(globe);
        }

        function render() { // main render loop

            requestAnimationFrame(render);
            stats.begin();

            if (orbitOn === true) {
                TWEEN.update();
            }

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

        function onWindowResize() { // function that resizes the canvas on screen resizing

            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);

        }

        window.addEventListener('resize', onWindowResize, false); // a listener to resize event

        function addLight() { // adds light to the scene

            //var ambLight = new THREE.AmbientLight(0xFFFFFF);
            var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
            dirLight.position.set(-100, 100, 100);
            dirLight.target = globe;

            // scene.add(ambLight);
            camera.add(dirLight);

        }

        function addControls() { // add controls to the scene

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

        function addAxisHelper() { // adds axis to the globe

            //if (scope.axishelp === false) return;

            var axes = new THREE.AxisHelper(200);
            axes.position.set(0, 0, 0);
            globe.add(axes);

        }

        function clickOn(event) { // function that determines intersection with meshes


            var x = event.clientX;
            var y = event.clientY;

            x -= container.offsetLeft;
            y -= container.offsetTop;

            var vector = new THREE.Vector3((x / container.offsetWidth) * 2 - 1, -(y / container.offsetHeight) * 2 + 1, 0.5);

            vector.unproject(camera);

            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

            var intersects = ray.intersectObjects(countries); // returns an object in any intersected on click


            if (intersects.length > 0) {

                if (intersects[0].object.userData.name == 'globe') return; // exclude invisible meshes from intersection

                cameraGoTo(intersects[0].object.userData.name);

            }
        }

        function requestCountriesData() { // requesting initial data of country borders

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

        function requestPopulationData() { // requests data of population

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

        function geoToxyz(lon, lat, r) { // turns longitude and lattitude to cartesian coordinates

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
                data[name].mesh = new THREE.Mesh(geometry, material);
                scene.add(data[name].mesh);
                // scale = Math.random()/2 + 50.5;
                scale = 50.5;
                data[name].mesh.scale.set(scale, scale, scale);
                data[name].mesh.geometry.computeBoundingSphere();
                data[name].mesh.userData.name = name;
                data[name].mesh.userData.code = data[name].code;
                data[name].mesh.userData.used = false;
                data[name].mesh.userData.countrycolor = countrycolor;
                //countries[data[name].code] = data[name].mesh;
                countries.push(data[name].mesh);
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
                $(document.body).append(cityname);
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

            for (var i = 0; i < countries.length; i++) {


                if (countries[i].userData.name.toLowerCase() == name.toLowerCase()) {

                    return countries[i];
                }
            }

        }

        function findCountryMeshByCode(code) {

            for (var i = 0; i < countries.length; i++) {


                if (countries[i].userData.code.toLowerCase() == code.toLowerCase()) {

                    return countries[i];
                }
            }
        }

        function highlightCountry(object) {

            if (INTERSECTED != object) {

                if (INTERSECTED) {

                    INTERSECTED.material.color.setHex(INTERSECTED.currentColor); // for countries shapes
                }
                INTERSECTED = object;
                INTERSECTED.currentColor = INTERSECTED.material.color.getHex();
                INTERSECTED.material.color.setHex(0x0000FF);
                $('.countryinfo').empty();
                var countryname = '<div class="countryinfo" style="position:absolute;top:150px;right:50px;color:white;font-size:30px;opacity:0.7;">' + INTERSECTED.userData.name + '</div>';
                $(document.body).append(countryname);
                if (twittermode && typeof INTERSECTED.userData.tweets !== 'undefined') {
                    var tweets = '<div class="countryinfo" style="position:absolute;top:200px;right:50px;color:white;font-size:30px;opacity:0.7;">' + 'tweets: ' + INTERSECTED.userData.tweets + '</div>';
                    $(document.body).append(tweets);
                }
            }
        }


        // Event listeners to distinguish a move and a click
        var moved = false;

        function onMouseUp(e) {

            if (!moved) {

                clickOn(e);
            }

            moved = false;
        };

        function onMouseMove(e) {

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

            resetCountries();

        });


        function showList(name) {

            if (name == '') $('.list').empty();

            for (var j = 0; j < countries.length; j++) {

                if (name.charAt(0) == countries[j].userData.name[0].toLowerCase()) {

                    list.push(countries[j].userData.name);

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
            var r = 255; // red chanel
            var g = 0; // green chanel
            var b = 0; // blue chanel
            var list = [];
            // var index = 0;
            array.sort(function(a, b) {
                return b.total_tweets - a.total_tweets
            });
            // var loop = setInterval(function() {
            var bottomcolor = 80;
            var colorstep = array[0].total_tweets / (255 - bottomcolor);

            $.each(array, function(index, country) {

                var countrymesh = findCountryMeshByCode(country._id.code);

                if (typeof countrymesh === 'undefined') {

                    console.log("Missing country " + country._id.country + " from globe dataset");
                    //index++;
                    return;
                }

                countrymesh.userData.used = true;

                // *** PUTS NUMBERS TO THE COUNTRY 

                //    if ( index < 10 ) {

                //     var position = countrymesh.geometry.boundingSphere.center.clone().setLength(51);

                //     var number = new THREEx.Text(index+1);

                //     scene.add(number);

                //    number.userData.name = 'number';
                //    countrymesh.userData.numbermesh = number;


                //     var objectNormal = new THREE.Vector3(0, 0, 1);

                //     var direction = new THREE.Vector3(position.x, position.y, position.z);
                //     direction.normalize();

                //     var angle = Math.acos(direction.z);
                //     var axis = new THREE.Vector3();
                //     axis.crossVectors(objectNormal, direction);
                //     axis.normalize();

                //     var quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

                //     number.rotation.setFromQuaternion(quaternion);
                //     number.position.copy(position);

                // }
                // if ( r > 0 ) r = r - 3;
                // else {
                // if ( g < 255 ) g = g + 3;
                // else {
                // if ( b < 255 ) b = b + 3;
                // }
                // }   // END OF NUMBER 

                if (index < 10) {

                    list.push( (index+1) + '. ' + country._id.country);
                }

                r = parseInt(bottomcolor + country.total_tweets / colorstep);
                var color = rgbToHex(r, g, b);
                countrymesh.material.color.set(color);
                countrymesh.userData.tweets = country.total_tweets;

                // $("#webgl").empty();
                // $('#webgl').append("<div style='position:absolute;top:200px;left:500px;color:white;font-size: 30px'>" + parseInt(step++) + "</div>");
                //console.log( parseInt(total += step) + '%');

                if (index == array.length - 1) {

                    var rank = "<div id='rank' style='position:absolute;top:200px;left:20px;color:white;font-size: 30px; opacity: 0.7'></div>";
                    $(document.body).append(rank);
                    $.each(list, function(index, value) {
                        $('#rank').append(value + '<br>');
                    });
                    console.log('100%');
                    callback();
                }

                //   index++;
                //  }, 100);
            });

        }

        function getTweets() {

            resetCountries();
            socket.emit('countries');
            twittermode = true;

        }

        function hideUnusedCountries() {

            $.each(countries, function(index, value) {

                if (countries[index].userData.used == false) {

                    countries[index].material.color.set(0x62626C);

                }

            });

        }

        function resetCountries() {

            twittermode = false;
            $('.countryinfo').empty();
            $('#rank').empty();

            $.each(countries, function(index, country) {

                if (country.userData.name !== 'globe') {
                    country.material.color.set(country.userData.countrycolor);

                    $.each(country.userData, function(i, mesh) {


                        if (mesh instanceof THREE.Mesh) {

                            scene.remove(mesh);

                            mesh.geometry.dispose();
                            mesh.material.dispose();
                        }

                    });

                }

            });


        }

    },
    showGlobe: function(data) {
        this.initGlobe();
    }
});