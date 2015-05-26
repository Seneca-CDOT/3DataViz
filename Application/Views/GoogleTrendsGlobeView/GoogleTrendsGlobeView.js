var Application = Application || {};

Application.GoogleTrendsGlobeView = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(config) {

        Application.BaseGlobeView.prototype.initialize.call(this, config);
        this.countries = [];
        this.timer; // represents timer for user mouse idle
        this.idle = true; // represents user mouse idle
        this.intersected; // intersected mesh
        this.moved = false; // for controls and mouse events
        this.sprites = [];
        this.suscribe();
        this.results = [];
        //this.decorator = config.decorators[0];
        this.collection = config.collection[0];
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

        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    },
    suscribe: function() {
        Application._vent.on('data/ready', this.showResults.bind(this));
       // Application._vent.on('globe/ready', this.processRequest.bind(this));
    },
    startDataSynchronization: function() {

        this.collection.fetch();

    },
    resetGlobe: function() {

        var that = this;
        $.each(that.added, function(index, country) {

            country.mesh.material.color.setHex(country.color);
        });
    },
    showResults: function(results) {

        if (results.length == 0) {
            console.log('No data was returned from Google Trends');
            return;
        };

        var that = this;

        results.forEach(function(item, index) {

            var countrymesh = that.decorators[0].findCountryByCode(item.countrycode);

            if (!countrymesh)
                return;

            console.log(countrymesh.userData.name);

            var obj = {};
            obj.mesh = countrymesh;
            obj.color = countrymesh.material.color.getHex();

            that.added.push(obj);

            if (typeof that.colors[index] !== 'undefined') {
                countrymesh.material.color.setHex(that.colors[index]);
            }

        });
    }

});