var Application = Application || {};

Application.SpreadSheetGlobeView = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(config) {
        Application.BaseGlobeView.prototype.initialize.call(this, config);
        // this._vent = config._vent;
        this.countries = [];
        this.intersected; // intersected mesh
        this.moved = false; // for controls and mouse events
        this.timer; // represents timer for user mouse idle
        this.idle = true; // represents user mouse idle
        this.sprites = [];
        this.suscribe();
        this.collection = config.collection[0];

        console.log('link: https://docs.google.com/spreadsheets/d/13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg/pubhtml');
        console.log('key: 13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg');
    },
    suscribe: function() {

        Application._vent.on('data/ready', this.showResults.bind(this));
        Application._vent.on('globe/ready', this.processRequest.bind(this));
    },
    processRequest: function() {

        this.collection.fetch();
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
    showResults: function(results) {

        var map = THREE.ImageUtils.loadTexture("Assets/Images/sprite.png");
        var material = new THREE.SpriteMaterial({

            map: map,
            color: 0xffffff,
            fog: true
        });

        results.sort(function(a, b) {

            return b.longitude - a.longitude;
        });

        var that = this;
        var time = 100;
        results.forEach(function(item) {

            time += 20;

            var sprite = new THREE.Sprite(material);
            setTimeout(function() {

                that.globe.add(sprite);

                var position = Application.Helper.geoToxyz(item.longitude, item.latitude, 51);
                sprite.position.copy(position);

                that.sprites.push(sprite);
            }, time);
        });
    }
});