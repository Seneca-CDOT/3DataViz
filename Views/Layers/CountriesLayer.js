var Application = Application || {};

Application.CountriesLayer = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(decorator, collections) {

        Application.BaseGlobeView.prototype.initialize.call(this, decorator, collections);

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
    destroy: function() {

        // console.log("CountriesLayer Destroy");

        Application.BaseGlobeView.prototype.destroy.call(this);
        //this.resetGlobe();
        this.colors = null;
        this.added = [];

        $.each(this.added, function(index, country) {
            country.mesh = null;
            country.color = null;
            country = null;
        });

    },
    suscribe: function() {
        Application.BaseGlobeView.prototype.suscribe.call(this);
    },
    processRequest: function() {

        this.collection[0].fetch();

    },
    resetGlobe: function() {

        var that = this;
        $.each(that.added, function(index, country) {

            country.mesh.material.color.setHex(country.color);

        });
    },
    getColor: function(cur, min, max) {

        var x = cur - min;
        var y = max - min;
        var value = x / y;

        return value;

    },
    createColors: function(results) {

        var that = this;
        var colors = {};

        var min = results[0].value;
        var max = results[results.length - 1].value;

        var uniques = _.chain(results).map(function(item) {
            return item.value
        }).uniq().value();

        $.each(uniques, function(index, number) {

            colors[number] = that.getColor(number, min, max);

        });

        return colors;
    },

    showResults: function() {

        var that = this;
        // console.log("CountriesLayer showResults");
        Application.BaseGlobeView.prototype.showResults.call(this, results);

        var results = this.collection[0].models;

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        };

        results.sort(function(a, b) {
            return a.value - b.value
        });

        var colorsMap = this.createColors(results);

        // var length = results.length;

        results.forEach(function(item, index) {

            var countrymesh = that.decorators[0].findCountryByCode(item.countrycode);

            if (!countrymesh) {
                console.log('Country ' + item.countrycode + ' is not available ');
                return;
            }

            console.log(countrymesh.userData.name);

            var obj = {};
            obj.mesh = countrymesh;
            obj.color = countrymesh.material.color.getHex();

            that.added.push(obj);

            countrymesh.material.color.r = colorsMap[item.value];
            countrymesh.material.color.g = 0;
            countrymesh.material.color.b = 0;


        });
    }

});
