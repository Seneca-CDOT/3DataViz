var Application = Application || {};

Application.SpreadSheetGlobeView = Application.BaseGlobeView.extend({

    // framework methods

    initialize: function(obj) {
        Application.BaseGlobeView.prototype.initialize.call(this);
        this._vent = obj._event;
        this.controlPanel = new Application.SpreadSheetControlPanel({
            event: this._vent
        });
        this.countries = [];
        this.intersected; // intersected mesh
        this.moved = false; // for controls and mouse events
        this.orbitOn = false;
        this.sprites = [];
        this.suscribe();
        console.log('https://docs.google.com/spreadsheets/d/13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg/pubhtml');
    },
    events: {

        'mousemove': 'onMouseMove',
        'mouseup': 'onMouseUp'

    },
    render: function() {
        Application.BaseGlobeView.prototype.render.call(this);
        this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    destroy: function() {

        this.collection.reset();
    },
    suscribe: function() {

        this._vent.on('click/submit', this.submit.bind(this));
        this._vent.on('click/reset', this.reset.bind(this));

    },
    submit: function(key) {

        var that = this;

        this.collection.setURL(key);

        this.collection.fetch({

            success: function(response) {

                that.addPoints(response);
            },
            error: function(error) {

                console.log('Error: ', error);
            }

        });
    },
    reset: function() {

        this.resetGlobe();
    },
    // member methods
    renderGlobe: function() {

        Application.BaseGlobeView.prototype.renderGlobe.call(this);

        if (this.orbitOn === true) {

            TWEEN.update();
        }

        this.camera.rotation.y += 0.1;

    },
    showGlobe: function() {
        Application.BaseGlobeView.prototype.showGlobe.call(this);
    },
    addGlobe: function() {
        Application.BaseGlobeView.prototype.addGlobe.call(this);

        this.countries.push(this.globe);
    },
    initGlobe: function() {
        Application.BaseGlobeView.prototype.initGlobe.call(this);

        var that = this;

        this.requestCountriesData().done(function(data) {

            that.addCountries(data);
        });
    },

    // interaction
    // TODO: move to base
    // ---
    onMouseUp: function(e) {

        if (!this.moved) {

            this.clickOn(e);
        }
        this.moved = false;
    },

    onMouseMove: function(e) {

        if (e.which == 1) {
            this.moved = true;
        }
    },
    clickOn: function(event) { // function that determines intersection with meshes

        var x = event.clientX;
        var y = event.clientY;

        x -= this.container.offsetLeft;
        y -= this.container.offsetTop;

        var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);
        vector.unproject(this.camera);

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
        var intersects = ray.intersectObjects(this.countries); // returns an object in any intersected on click
        if (intersects.length > 0) {

            if (intersects[0].object.userData.name == 'globe') return; // exclude invisible meshes from intersection

            this.cameraGoTo(intersects[0].object.userData.name);
            console.log(intersects[0].object.userData.name);
        }
    },

    cameraGoTo: function(countryname) {

        moved = true;
        this.controls.removeMouse();

        var countrymesh = this.findCountryMeshByName(countryname);
        if (countrymesh === undefined) {

            return;
        }

        var current = this.controls.getPosition();

        var destination = countrymesh.geometry.boundingSphere.center.clone();
        destination.setLength(this.controls.getRadius());

        this.highlightCountry(countrymesh);


        if (this.orbitOn == true) {
            tween.stop();
        }

        var that = this;

        tween = new TWEEN.Tween(current)
            .to({
                x: destination.x,
                y: destination.y,
                z: destination.z
            }, 1000)

        .easing(TWEEN.Easing.Sinusoidal.InOut)
            .onUpdate(function() {

                that.controls.updateView({
                    x: this.x,
                    y: this.y,
                    z: this.z
                });

            })
            .onComplete(function() {
                that.orbitOn = false;
                that.controls.addMouse();
            });

        this.orbitOn = true;
        tween.start();
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

    addCountries: function(data) {

        var i = 10;

        var that = this;

        $.each(data, function(name, index) {

            var countrycolor = Application.Helper.rgbToHex(10, i++, 0);

            var material = new THREE.MeshPhongMaterial({
                shininess: 0,
                color: countrycolor
            });
            var geometry = new Map3DGeometry(data[name], 0);
            data[name].mesh = new THREE.Mesh(geometry, material);
            that.scene.add(data[name].mesh);

            var scale = 50.5;
            data[name].mesh.scale.set(scale, scale, scale);
            data[name].mesh.geometry.computeBoundingSphere();
            data[name].mesh.userData.name = name;
            data[name].mesh.userData.code = data[name].code;
            data[name].mesh.userData.used = false;
            data[name].mesh.userData.countrycolor = countrycolor;
            // countries[data[name].code] = data[name].mesh;
            that.countries.push(data[name].mesh);
        });
    },
    // ---

    resetGlobe: function() {

        var that = this;

        this.sprites.forEach(function(sprite) {

            that.scene.remove(sprite);

            sprite.geometry.dispose();
            sprite.material.dispose();

        });
    },

    hideUnusedCountries: function() {

        $.each(this.countries, function(index, country) {

            if (country.userData.used == false) {

                country.material.color.set(0x62626C);
            }
        });
    },

    findCountryMeshByName: function(name) {
        for (var i = 0; i < this.countries.length; i++) {

            if (this.countries[i].userData.name.toLowerCase() == name.toLowerCase()) {

                return this.countries[i];
            }
        }
    },

    findCountryMeshByCode: function(code) {

        for (var i = 0; i < this.countries.length; i++) {
            if (this.countries[i].userData.code.toLowerCase() == code.toLowerCase()) {

                return this.countries[i];
            }
        }
    },

    highlightCountry: function(object) {

        if (this.intersected != object) {

            if (this.intersected) {

                this.intersected.material.color.setHex(this.intersected.currentColor); // for countries shapes
            }
            this.intersected = object;
            this.intersected.currentColor = this.intersected.material.color.getHex();
            this.intersected.material.color.setHex(0x0000FF);

        }
    },

    numToScale: function(array, callback) {

        var step = 100 / array.length;
        var total = 0;
        var r = 255; // red chanel
        var g = 0; // green chanel
        var b = 0; // blue chanel
        var list = [];
        // var index = 0;
        array.sort(function(a, b) {
            return b.attributes.total_tweets - a.attributes.total_tweets;
        });
        // var loop = setInterval(function() {
        // var bottomcolor = 80;
        // var colorstep = array[0].total_tweets / (255 - bottomcolor);

        var maxscalefactor = 0.5;
        var scalestep = maxscalefactor / array[0].attributes.total_tweets;


        $.each(array, function(index, country) {

            var countrymesh = this.findCountryMeshByCode(country.attributes.countrycode);

            if (typeof countrymesh === 'undefined') {

                console.log("Missing country " + country.attributes.country + " from globe dataset");
                //index++;
                return;
            }

            countrymesh.userData.used = true;

            if (index < 10)
                list.push((index + 1) + '. ' + country.attributes.country);

            var scalar = scalestep * country.attributes.total_tweets;
            console.log(scalar);
            countrymesh.scale.multiplyScalar(1 + scalar);
            countrymesh.userData.tweets = country.attributes.total_tweets;

            if (index == array.length - 1) {

                $.each(list, function(index, value) {
                    //  $('#leftcolumn').append(value + '<br>');
                });
                console.log('100%');
                // callback();
            }

            //   index++;
            //  }, 100);
        }.bind(this));
    },

    addPoints: function(array) {

        var that = this;

        var map = THREE.ImageUtils.loadTexture("Assets/images/sprite.png");

        var material = new THREE.SpriteMaterial({
            map: map,
            color: 0xffffff,
            fog: true
        });
        var time = 100;

        array.models.sort(function(a, b) {
            return b.get('longitude') - a.get('longitude');
        });

        array.forEach(function(item) {

            time = time + 20;

            var sprite = new THREE.Sprite(material);

            setTimeout(function() {

                that.scene.add(sprite);

                var position = Application.Helper.geoToxyz(item.attributes.longitude, item.attributes.latitude, 51);

                sprite.position.copy(position);

                that.sprites.push(sprite);

            }, time);


        });

    }

});