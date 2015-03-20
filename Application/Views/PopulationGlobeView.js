var Application = Application || {};

Application.PopulationGlobeView = Application.BaseGlobeView.extend({

    // framework methods

    initialize: function() {
        Application.BaseGlobeView.prototype.initialize.call(this);

        this.countries = [];
        this.spikes = []; // an array of spike objects
        this.cities = []; // an array of cities names meshes

        this.population_array = []; // an array of population meshes

        this.midpoints = [];
        this.list = [];
        this.twittermode = false;
    },
    render: function() {
        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    },
    
    // member methods

    showGlobe: function() {
        Application.BaseGlobeView.prototype.showGlobe.call(this);
    },
    addGlobe: function() {
        Application.BaseGlobeView.prototype.addGlobe.call(this);

        this.countries.push(this.globe);
    },
    initGlobe: function() {
        Application.BaseGlobeView.prototype.initGlobe.call(this);

        this.requestCountriesData().done(this.addCountries.bind(this));

        // WARNING! This is the second call to render the globe. 
        // The first rendering is invoked from the base class "initGlobe:" 
        // implementation. See Application.BaseGlobeView declaration.

        // this.renderGlobe();
// ************************

        function clickOn(event) { // function that determines intersection with meshes

            var x = event.clientX;
            var y = event.clientY;

            x -= this.container.offsetLeft;
            y -= this.container.offsetTop;

            var vector = new THREE.Vector3((x / container.offsetWidth) * 2 - 1, -(y / container.offsetHeight) * 2 + 1, 0.5);
            vector.unproject(camera);

            var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
            var intersects = ray.intersectObjects(this.countries); // returns an object in any intersected on click
            if (intersects.length > 0) {

                if (intersects[0].object.userData.name == 'globe') return; // exclude invisible meshes from intersection

                cameraGoTo(intersects[0].object.userData.name);
            }
        }

        function cameraGoTo(countryname) {

            document.removeEventListener('mouseup', onMouseUp, false);
            moved = true;
            this.controls.removeMouse();

            var countrymesh = findCountryMeshByName(countryname);
            if (countrymesh === undefined) {

                // $('.cityname').empty();
                // var cityname = '<div class="cityname" style="position:absolute;top:150px;right:50px;color:white;font-size:30px;opacity:0.7;">' + "Not found" + '</div>';
                // $(document.body).append(cityname);
                return;
            }

            var current = this.controls.getPosition();

            //   for (var i = 0; i < countries.length; i++) {

            //   if (countries[i].name == country) {

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

            if (this.orbitOn == true) {
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
                    this.orbitOn = false;
                    document.addEventListener('mouseup', onMouseUp, false);
                    controls.addMouse();
                });

            this.orbitOn = true;
            tween.start();
        }

        function addBorders(coordinates, name) {
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
            this.globe.add(shape);
            shape.name = name;
            this.countries.push(shape);
        }

        function readCountries(data, callback) {

            for (var i = 0; i < data.features.length; i++) {

                addBorders(data.features[i].geometry.coordinates, data.features[i].properties.NAME);
            }
            callback();
        }

        function resetCountries() {

            this.twittermode = false;
            $('.countryinfo').empty();
            $('#rank').empty();

            $.each(this.countries, function(index, country) {

                if (country.userData.name !== 'globe') {
                    country.material.color.set(country.userData.countrycolor);

                    $.each(country.userData, function(i, mesh) {

                        if (mesh instanceof THREE.Mesh) {

                            this.scene.remove(mesh);

                            mesh.geometry.dispose();
                            mesh.material.dispose();
                        }
                    });
                }
            });
        }

        function hideUnusedCountries() {

            $.each(this.countries, function(index, value) {

                if (this.countries[index].userData.used == false) {

                    this.countries[index].material.color.set(0x62626C);
                }
            });
        }

        function findCountryMeshByName(name) {
            for (var i = 0; i < this.countries.length; i++) {

                if (this.countries[i].userData.name.toLowerCase() == name.toLowerCase()) {

                    return this.countries[i];
                }
            }
        }

        function findCountryMeshByCode(code) {
            for (var i = 0; i < this.countries.length; i++) {
                if (this.countries[i].userData.code.toLowerCase() == code.toLowerCase()) {

                    return this.countries[i];
                }
            }
        }

        function highlightCountry(object) {

            // if (INTERSECTED != object) {

            //     if (INTERSECTED) {

            //         INTERSECTED.material.color.setHex(INTERSECTED.currentColor); // for countries shapes
            //     }
            //     INTERSECTED = object;
            //     INTERSECTED.currentColor = INTERSECTED.material.color.getHex();
            //     INTERSECTED.material.color.setHex(0x0000FF);
            //     $('.countryinfo').empty();
            //     var countryname = '<div class="countryinfo" style="position:absolute;top:150px;right:50px;color:white;font-size:30px;opacity:0.7;">' + INTERSECTED.userData.name + '</div>';
            //     $(document.body).append(countryname);
            //     if (twittermode && typeof INTERSECTED.userData.tweets !== 'undefined') {

            //         var tweets = '<div class="countryinfo" style="position:absolute;top:200px;right:50px;color:white;font-size:30px;opacity:0.7;">' + 'tweets: ' + INTERSECTED.userData.tweets + '</div>';
            //         $(document.body).append(tweets);
            //     }
            // }
        }

// ***********************     

// TODO: move out of this view

        // Event listeners to distinguish a move and a click
        var moved = false;
        function onMouseUp(e) {
            if (!moved) {

                // clickOn(e);
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
            // var code = e.keyCode || e.which;
            // if (code !== 13) {

            //     var name = $('#country').val();
            //     showList(name);
            // }
        });

        $(document).on("keypress", function(e) {
            // var code = e.keyCode || e.which;
            // if (code == 13) {

            //     e.preventDefault();
            //     $('#cityname').empty();
            //     var name = $('#country').val();
            //     cameraGoTo(name);
            //     $('.list').empty();
            // }
        });

        $('#tweets').on("click", function(e) {
            // getTweets();
        });

        $('#reset').on("click", function(e) {
            // resetCountries();
        });

        function showList(name) {
            // if (name == '') $('.list').empty();
            // for (var j = 0; j < countries.length; j++) {

            //     if (name.charAt(0) == countries[j].userData.name[0].toLowerCase()) {
            //         list.push(countries[j].userData.name);
            //     }
            // }

            // $('.list').empty();
            // var countrylist = '<div class="list" style="position:absolute;top:250px;right:50px;color:white;font-size:30px;opacity:0.7;">';
            // for (var x = 0; x < list.length; x++) {

            //     countrylist += list[x] + '<br>';
            // }

            // countrylist += '</div>';
            // $('#webgl').append(countrylist);

            // list = [];
        }
    },

// TODO: move out of this view

    getTweets: function() {

        resetCountries();
        socket.emit('countries');
        this.twittermode = true;
    },
    requestCountriesData: function() { // requesting initial data of country borders

        return $.ajax({
            type: 'GET',
            url: 'Models/geodata.json',
            dataType: 'json',
            cache: false, // sometimes old info stuck in cache
            error: function() {
                console.log('An error occurred while processing a countries file.');
            }
        });
    },
    requestPopulationData: function() { // requests data of population

        return $.ajax({
            type: 'GET',
            url: 'data/data.json',
            dataType: 'json',
            cache: false, // sometimes old info stuck in cache
            error: function() {
                console.log('An error occurred while processing a data file.');
            }
        });
    },

// TODO: move out of this view

    geoToxyz: function(lon, lat, r) { // turns longitude and lattitude to cartesian coordinates

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
    },
    componentToHex: function(c) {

        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },
    rgbToHex: function(r, g, b) {

        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },

// *************************

    addCountries: function(data) {

        var i = 10;
        for (var name in data) {

            var countrycolor = this.rgbToHex(10, i++, 0);

            var material = new THREE.MeshPhongMaterial({
                shininess: 0,
                color: countrycolor
            });
            var geometry = new Map3DGeometry(data[name], 0);
            data[name].mesh = new THREE.Mesh(geometry, material);
            this.scene.add(data[name].mesh);

            var scale = 50.5;
            data[name].mesh.scale.set(scale, scale, scale);
            data[name].mesh.geometry.computeBoundingSphere();
            data[name].mesh.userData.name = name;
            data[name].mesh.userData.code = data[name].code;
            data[name].mesh.userData.used = false;
            data[name].mesh.userData.countrycolor = countrycolor;
            // countries[data[name].code] = data[name].mesh;
            // this.countries.push(data[name].mesh);
        }
    },

// *************************    

    addSpikes: function(data, callback) {

        var i = 0;
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
            this.globe.add(spike);

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

            this.cities.push(cityname);
            this.population_array.push(population);

            this.globe.add(cityname);
            this.globe.add(population);

            cityname.visible = false;
            population.visible = false;

            cityname.position.copy(spike.position);
            population.position.copy(spike.position);
            population.position.y += height / 2;
            cityname.position.y += height / 2 + 2;
        }
        callback();
    },
    drawStar: function(name) {

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

        this.scene.add(mesh);
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
    },
    drawAmount: function(array, callback) {

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

                this.list.push( (index+1) + '. ' + country._id.country);
            }

            r = parseInt(bottomcolor + country.total_tweets / colorstep);
            var color = this.rgbToHex(r, g, b);
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


});