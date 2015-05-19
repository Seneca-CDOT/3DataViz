var Application = Application || {};

Application.SpreadSheetGlobeView = Application.BaseGeometryGlobeView.extend({

    // framework methods
    initialize: function(obj) {
        Application.BaseGeometryGlobeView.prototype.initialize.call(this);
        this._vent = obj._vent;
        this.countries = [];
        this.intersected; // intersected mesh
        this.moved = false; // for controls and mouse events
        this.timer; // represents timer for user mouse idle
        this.idle = true; // represents user mouse idle
        this.sprites = [];
        this.suscribe();

        console.log('https://docs.google.com/spreadsheets/d/13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg/pubhtml');
    },
    render: function() {

        Application.BaseGeometryGlobeView.prototype.render.call(this);
        return this;
    },
    suscribe: function() {

        this._vent.on('click/submit', this.submit.bind(this));
        this._vent.on('click/reset', this.resetGlobe.bind(this));
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
    resetGlobe: function() {

        var that = this;
        this.sprites.forEach(function(sprite) {

            that.scene.remove(sprite);

            sprite.geometry.dispose();
            sprite.material.dispose();
        });
    },

    // visualization specific functionality
    addPoints: function(array) {

        var map = THREE.ImageUtils.loadTexture("Assets/Images/sprite.png");
        var material = new THREE.SpriteMaterial({

            map: map,
            color: 0xffffff,
            fog: true
        });

        array.models.sort(function(a, b) {

            return b.get('longitude') - a.get('longitude');
        });

        var that = this;
        var time = 100;
        array.forEach(function(item) {

            time += 20;

            var sprite = new THREE.Sprite(material);
            setTimeout(function() {

                that.globe.add(sprite);

                var position = Application.Helper.geoToxyz(item.attributes.longitude, item.attributes.latitude, 51);
                sprite.position.copy(position);

                that.sprites.push(sprite);
            }, time);
        });
    },

    cameraGoTo: function(countrymesh) {

        Application.BaseGeometryGlobeView.prototype.cameraGoTo.call(this, countrymesh);

        this.highlightCountry(countrymesh);
    },

    didLoadGeometry: function() {

        Application.BaseGeometryGlobeView.prototype.didLoadGeometry.call(this);

        var that = this;
        $.each(this.rayCatchers, function(index, catcher) {

            if (catcher != that.globe) {

                that.countries.push(catcher);
            }
        });
    }
});