var Application = Application || {};

Application.PointsLayer = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(decorator, collections) {
        Application.BaseGlobeView.prototype.initialize.call(this, decorator, collections);
        this.sprites = [];
        this.moObjects = [];
        this.prevObject;
        this.texture = THREE.ImageUtils.loadTexture("Assets/images/disc.png");

    },
    suscribe: function() {

        Application.BaseGlobeView.prototype.suscribe.call(this);
    },
    destroy: function() {

        Application.BaseGlobeView.prototype.destroy.call(this);
        this.sprites = null;
    },
    clickOn: function(event) {

        var that = this;

        var intersectedMesh = Application.BaseGlobeView.prototype.clickOn.call(this, event);

        if (intersectedMesh) {

            var name = intersectedMesh.object.userData.name;

            Application._vent.trigger('vizinfocenter/message/on', name +
            ': ' + that.pointsPerCountry(that.sprites, name) + ' points');
        }
    },
    reset: function() {
        Application.BaseGlobeView.prototype.reset.call(this);
        this.resetGlobe();
    },
    // member methods
    resetGlobe: function() {

        var that = this;

        if (this.timer.length) {

            $.each(this.timer, function(index, id) {
                clearTimeout(id);
            });
        }

        this.moObjects = [];
        this.sprites.forEach(function(sprite) {

            that.globe.remove(sprite);

            sprite.geometry.dispose();
            sprite.material.dispose();
        });
        this.sprites = [];
    },
    onMouseMove: function(e) {

        Application.BaseGlobeView.prototype.onMouseMove.call(this, e);

        //ray casting
        var closest = this.rayCast(this.moObjects, e);

        if (closest != null) {
            if (closest.object.name !== 'globe' && closest.object.visible) {

                if (this.prevObject) this.prevObject.object.material.color.setHex(this.prevObject.object.userData.result_color);

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
            }else{
                if (this.prevObject){
                    this.prevObject.object.material.color.setHex(this.prevObject.object.userData.result_color);
                    this.prevObject = null;
                }
            }
        } else {
            if (this.prevObject){
                this.prevObject.object.material.color.setHex(this.prevObject.object.userData.result_color);
                this.prevObject = null;
            }
            Application._vent.trigger('vizinfocenter/message/off');
        }

    },
    // visualization specific functionality
    showResults: function(results) {

        Application.BaseGlobeView.prototype.showResults.call(this, results);

        //this.resetGlobe();

        //First time
        if (!results){
          results = this.collection[0].models;
          this.getCategoriesWithColors(results);
        }

        var that = this;

        Application.BaseGlobeView.prototype.showResults.call(this, results);
        Application._vent.trigger('title/message/on', Application.userConfig.templateTitle);

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        } else if (!results[0].latitude || !results[0].longitude) {
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }

        Application._vent.trigger('controlpanel/message/off');

        var material = new THREE.SpriteMaterial({
            map: this.texture,
            color: 0xFFFFFF,
        });

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

                    // console.log('Data has no country identified');
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

            var color = that.getColorByCategory(sprite.userData.category) || '0xffffff';

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

                sprite.material.color.setHex(color);
                sprite.position.copy(position);
                sprite.userData.label = item.label;
                sprite.userData.value = item.value;
                sprite.userData.country = that.determineCountry(sprite);

                sprite.userData.result_color = color;


            }, time);

            if (that.timer != null) that.timer.push(timer);

        });

        that.moObjects.push(this.globe);

    },
    showFilteredResults: function(results) {

        Application.BaseGlobeView.prototype.showFilteredResults.call(this, results);
    },
    sortResultsByCategory: function() {

        var that = this;

        Application.BaseGlobeView.prototype.sortResultsByCategory.call(this);

        //this.resetGlobe();
        this.showAllResults();

        // if (category == 'All') return;
        if (this.activeCategories.length != 0) {

            $.each(this.sprites, function(index, point) { // turn all added countries grey

                point.visible = false;

            });
        }

        $.each(this.activeCategories, function(i, category) {

            $.each(that.sprites, function(i, point) {

                if (point.userData.category == category) {

                    point.visible = true;
                    point.material.color.setHex(point.userData.result_color);

                }

            });

        });

    },
    showAllResults: function() {

        Application.BaseGlobeView.prototype.showAllResults.call(this);

        $.each(this.sprites, function(index, point) {

            point.visible = true;
            point.material.color.setHex(point.userData.result_color);

        });
    },
});
