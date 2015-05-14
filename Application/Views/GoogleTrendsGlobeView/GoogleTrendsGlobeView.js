var Application = Application || {};

Application.GoogleTrendsGlobeView = Application.BaseGeometryGlobeView.extend({

    // framework methods

    initialize: function(obj) {
        Application.BaseGeometryGlobeView.prototype.initialize.call(this);
        this._vent = obj._vent;
        // this.controlPanel = new Application.GoogleTrendsControlPanel({
        //     event: this._vent
        // });
        this.countries = [];
        this.timer; // represents timer for user mouse idle
        this.idle = true; // represents user mouse idle
        this.intersected; // intersected mesh
        this.moved = false; // for controls and mouse events
        this.sprites = [];
        this.added = []; // list of countries participating and their old colors
        this.suscribe();
        this.colors = [

            '0xFF0000',
            '0xFF1919',
            '0xFF3333',
            '0xFF4D4D',
            '0xFF6666',
            '0xFF8080',
            '0xFF9999',
            '0xFFB2B2',
            '0xFFCCCC',
            '0xFFE6E6'
        ]
    },

    render: function() {
        Application.BaseGeometryGlobeView.prototype.render.call(this);
        //this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    destroy: function() {

        this.collection.reset();
    },
    suscribe: function() {

        this._vent.on('click/submit', this.submit.bind(this));
        this._vent.on('click/reset', this.reset.bind(this));
        this._vent.on('trends/parsed', this.showCountries.bind(this));
    },
    onMouseMove: function(e) {

        var that = this;
        Application.BaseGeometryGlobeView.prototype.onMouseMove.call(this, e);
        this.idle = false;
        clearTimeout(this.timer);
        this.timer = setTimeout(function() {
            that.idle = true
        }, 5000);
    },
    submit: function(key) {

        var that = this;
        this.collection.setURL(key);
        this.collection.reset();
        this.resetGlobe();
        this.collection.request();

        console.clear();

    },
    reset: function() {

        this.resetGlobe();
    },
    renderGlobe: function() {

        Application.BaseGeometryGlobeView.prototype.renderGlobe.call(this);

        if (this.idle === true) {

            this.globe.rotation.y -= 0.0003;
        }
    },
    resetGlobe: function() {

        var that = this;
        $.each(that.added, function(index, country) {

            country.mesh.material.color.setHex(country.color);
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
    showCountries: function(array) {

        var that = this;
        array.forEach(function(item, index) {

            var countrymesh = that.findCountryMeshByCode(item.countrycode);

            if (!countrymesh) 
                return;

            console.log(countrymesh.userData.name);

            var obj = {};
            obj.mesh = countrymesh;
            obj.color = countrymesh.material.color.getHex();

            that.added.push(obj);
            countrymesh.material.color.setHex(that.colors[index]);
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