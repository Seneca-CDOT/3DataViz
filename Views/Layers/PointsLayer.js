var Application = Application || {};

Application.PointsLayer = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(decorator, collections) {
        Application.BaseGlobeView.prototype.initialize.call(this, decorator, collections);
        // this._vent = config._vent;
        //this.countries = [];
        //this.intersected; // intersected mesh
        //this.moved = false; // for controls and mouse events
        //this.timer; // represents timer for user mouse idle
        //this.idle = true; // represents user mouse idle
        this.sprites = [];
        this.moObjects = [];
        this.prevObject;
        //this.suscribe();
        //this.collection = config.collection[0];
        this.texture = THREE.ImageUtils.loadTexture("Assets/images/disc.png");

        console.log('link: https://docs.google.com/spreadsheets/d/13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg/pubhtml');
        console.log('key: 13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg');
    },
    suscribe: function() {

        Application.BaseGlobeView.prototype.suscribe.call(this);
        //Application._vent.on('data/ready', this.showResults.bind(this));
        //Application._vent.on('globe/ready', this.processRequest.bind(this));
    },
    destroy: function() {

        console.log("PointsLayer Destroy");

        Application.BaseGlobeView.prototype.destroy.call(this);
        // Application._vent.unbind('globe/ready');
        this.sprites = null;
        // Application._vent.unbind('globe/ready');
    },
    clickOn: function(event) {

        var that = this;

        var intersectedMesh = Application.BaseGlobeView.prototype.clickOn.call(this, event);


        if (intersectedMesh) {

            //$.each(this.rayCatchers, function(index, countrymesh) {

            //    if (intersectedMesh.object == countrymesh) {

                    var name = intersectedMesh.object.userData.name;

                    Application._vent.trigger('vizinfocenter/message/on', name +
                        ': ' + that.pointsPerCountry(that.sprites, name) + ' points');
                // }

            // });

        }

    },
    // member methods
    resetGlobe: function() {

        var that = this;
        this.sprites.forEach(function(sprite) {

            that.scene.remove(sprite);

            sprite.geometry.dispose();
            sprite.material.dispose();
        });
    },
    onMouseMove: function(e) {

        Application.BaseGlobeView.prototype.onMouseMove.call(this, e);

        //ray casting
        var closest = this.rayCast(this.moObjects, e);

        if (closest != null) {
            if (closest.object.name !== 'globe') {

                if (this.prevObject) this.prevObject.object.material.color.set('white');
                this.prevObject = closest;
                closest.object.material.color.set('red');
                var data = closest.object.userData;
                var msg = "";
                if (typeof data.label !== 'undefined') {
                    msg += data.label + " ";
                }
                if (typeof data.value !== 'undefined') {
                    msg += ("<br>(" + data.value + ")");
                }
                if (msg !== "") {
                    Application._vent.trigger('vizinfocenter/message/on', msg);
                }
            }
        } else {
            Application._vent.trigger('vizinfocenter/message/off');

        }

    },
    // visualization specific functionality
    showResults: function() {

        console.log("PointsLayer showResults");
        var results = this.collection[0].models;
        var that = this;

        Application.BaseGlobeView.prototype.showResults.call(this, results);
        Application._vent.trigger('title/message/on', Application.userConfig.vizTitle);

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        } else if (!results[0].latitude || !results[0].longitude) {
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }


        Application._vent.trigger('controlpanel/message/off');
        // var map = THREE.ImageUtils.loadTexture("Assets/images/sprite.png");
        // var map = THREE.ImageUtils.loadTexture("Assets/images/sprite_spark.png");
        var material = new THREE.SpriteMaterial({
            map: this.texture,
            color: 0xFFFFFF,
            blending: THREE.AdditiveBlending,
        });

        // var destination;
        var hasGeo = false;

        if (typeof results[0].longitude === "undefined" && typeof results[0].latitude === "undefined") {

            $.each(results, function(index, item) {

                if (item.countrycode != "") {
                    var mesh = that.decorators[0].findCountryByCode(item.countrycode);
                    var destination = mesh.geometry.boundingSphere.center.clone();
                    destination.setLength(that.globeRadius + 1);
                    results[index].destination = destination;

                } else if (item.countryname != "") {
                    var mesh = that.decorators[0].findCountryByName(item.countryname);
                    var destination = mesh.geometry.boundingSphere.center.clone();
                    destination.setLength(that.globeRadius + 1);
                    results[index].destination = destination;
                } else {

                    console.log('Data has no country identified');
                }



            });
        } else {

            hasGeo = true;

            results.sort(function(a, b) {

                return b.longitude - a.longitude;
            });

        }

        var time = 100;

        $.each(results, function(index, item) {

            time += 20;

            var sprite = new THREE.Sprite(material.clone());
            sprite.scale.multiplyScalar(2);


            if (item.category) sprite.userData.category = item.category;

            that.sprites.push(sprite);
            that.moObjects.push(sprite);

            var timer = setTimeout(function() {

                if (that.globe == null) {
                    return;
                };

                that.globe.add(sprite);

                if (hasGeo) {

                    var position = Application.Helper.geoToxyz(item.longitude, item.latitude, 51);

                } else {

                    var position = results[index].destination;

                }

                sprite.position.copy(position);
                sprite.userData.label = item.label;
                sprite.userData.value = item.value;
                sprite.userData.country = that.determineCountry(sprite);
                sprite.userData.result_color = '0xFFFFFF';

            }, time);

            if (that.timer != null) that.timer.push(timer);

        });

        that.moObjects.push(this.globe);

    },
    sortResultsByCategory: function() {

        var that = this;

        Application.BaseGlobeView.prototype.sortResultsByCategory.call(this);

        //this.resetGlobe();
        this.showAllResults();

        // if (category == 'All') return;
        if (this.activeCategories.length != 0) {

            $.each(this.sprites, function(index, point) { // turn all added countries grey

                point.material.color.setHex(0x000000);

            });
        }

        $.each(this.activeCategories, function(i, category) {

            $.each(that.sprites, function(i, point) {

                if (point.userData.category == category) {

                    point.material.color.setHex(point.userData.result_color);

                }

            });

        });

    },
    showAllResults: function() {

        Application.BaseGlobeView.prototype.showAllResults.call(this);

        this.resetGlobe();

        $.each(this.sprites, function(index, point) {

            point.material.color.setHex(point.userData.result_color);

        });
    },
});
