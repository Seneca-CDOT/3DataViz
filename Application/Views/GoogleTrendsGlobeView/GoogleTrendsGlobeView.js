var Application = Application || {};

Application.GoogleTrendsGlobeView = Application.BaseGeometryGlobeView.extend({

    // framework methods
    initialize: function(obj) {

        Application.BaseGeometryGlobeView.prototype.initialize.call(this);

        this._vent = obj._event;
        this.controlPanel = new Application.GoogleTrendsControlPanel({
            event: this._vent
        });        

        this.sprites = [];
        this.suscribe();

        this.added = []; // list of countries participating and their old colors
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
        ];
    },
    render: function() {

        Application.BaseGeometryGlobeView.prototype.render.call(this);
        this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    suscribe: function() {

        this._vent.on('click/submit', this.submit.bind(this));
        this._vent.on('click/reset', this.resetGlobe.bind(this));
        this._vent.on('trends/parsed', this.showCountries.bind(this));
    },
    submit: function(key) {

        this.collection.setURL(key);
        this.collection.reset();
        this.resetGlobe();
        this.collection.request();

        console.clear();
    },
    resetGlobe: function() {

        var that = this;
        $.each(that.added, function(index, country) {

            country.mesh.material.color.setHex(country.color);
        });
    },

    // visualization specific functionality
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

            // DANGER! Index can be out of range of the colors array!
            countrymesh.material.color.setHex(that.colors[index]);
        });
    }
});
