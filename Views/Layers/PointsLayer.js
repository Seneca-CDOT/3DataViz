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
        //this.suscribe();
        //this.collection = config.collection[0];

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
    showResults: function() {

        console.log("PointsLayer showResults");
        var results = this.collection[0].models;
        var that = this;

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        }else if( !results[0].latitude || !results[0].longitude ){
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }


        Application._vent.trigger('controlpanel/message/off');
        var map = THREE.ImageUtils.loadTexture("Assets/images/sprite.png");
        var material = new THREE.SpriteMaterial({

            map: map,
            color: 0xffffff,
            fog: true
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

            var sprite = new THREE.Sprite(material);
            sprite.scale.multiplyScalar(5);
            var timer = setTimeout(function() {

                if(that.globe == null){ return; };

                that.globe.add(sprite);

                if (hasGeo) {

                    var position = Application.Helper.geoToxyz(item.longitude, item.latitude, 51);

                } else {

                    var position = results[index].destination;

                }
                sprite.position.copy(position);

                that.sprites.push(sprite);

            }, time);

            if(that.timer != null) that.timer.push(timer);

        });
    }
});