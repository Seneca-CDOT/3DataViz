var Application = Application || {};

Application.CountriesLayer = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(decorator, collections) {

        Application.BaseGlobeView.prototype.initialize.call(this, decorator, collections);

        this.added = []; // list of countries participating and their old colors

    },
    render: function() {

        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    },
    clickOn: function(event) {

        var intersectedMesh = Application.BaseGlobeView.prototype.clickOn.call(this, event);

        var found = false;

        Application._vent.trigger('vizinfocenter/message/off');

        if (intersectedMesh) {

            $.each(this.added, function(index, country) {

                if (intersectedMesh.object == country.mesh) {

                    console.log(country.value);
                    Application._vent.trigger('vizinfocenter/message/on', country.mesh.userData.name +
                        ' : ' + Application.Helper.formatNumber(country.value));
                    found = true;
                }

            });
            
         if (!found) Application._vent.trigger('vizinfocenter/message/on', intersectedMesh.object.userData.name);
        }

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

        // console.log("CountriesLayer showResults");
        Application.BaseGlobeView.prototype.showResults.call(this, results);
        var that = this;

        Application._vent.trigger('controlpanel/message/off');
        
        var results = this.collection[0].models;

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        };

        results.sort(function(a, b) { // sorts array in ascending order by value
            return a.value - b.value
        });

        var colorsMap = this.createColors(results); // creates a colors map relative to the values

        if (results[0].countryname != '') {
            var search = 'countryname';
        }

        if (results[0].countrycode != '') {
            var search = 'countrycode';
        }

        results.forEach(function(item, index) {


            var countrymesh = that.decorators[0].findCountry(item[search], search);

            if (!countrymesh) {
                console.log('Country ' + ( item.countrycode || item.countryname ) + ' is not available ');
                return;
            }

            // console.log(countrymesh.userData.name, ' ' + item.value + '%');

            var obj = {};
            obj.mesh = countrymesh;
            obj.color = countrymesh.material.color.getHex();
            obj.value = item.value;

            that.added.push(obj);

            countrymesh.material.color.r = 1;
            countrymesh.material.color.g = 1 - colorsMap[item.value];
            countrymesh.material.color.b = 1 - colorsMap[item.value];


        });
    }

});
