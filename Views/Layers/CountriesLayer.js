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

        //  this.inter();

        var intersectedMesh = Application.BaseGlobeView.prototype.clickOn.call(this, event);

        var found = false;

        if (intersectedMesh) {

            $.each(this.added, function(index, country) {

                if (intersectedMesh.object == country.mesh) {


                    console.log(country.value);
                    Application._vent.trigger('vizinfocenter/message/on', country.mesh.userData.name +
                        '<br>' + Application.Helper.formatNumber(country.value));
                    found = true;
                }

            });

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
        var results = this.collection[0].models;
        var that = this;

        Application.BaseGlobeView.prototype.showResults.call(this, results);

        Application._vent.trigger('title/message/on', Application.userConfig.templateTitle);

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        } else if (!(results[0].countryname || results[0].countrycode)) {
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }

        Application._vent.trigger('controlpanel/message/off');

        results.sort(function(a, b) { // sorts array in ascending order by value
            return a.value - b.value
        });

        var colorsMap = this.createColors(results); // creates a colors map relative to the values

        if (results[0].countryname) {
            var search = 'countryname';
        }

        if (results[0].countrycode) {
            var search = 'countrycode';
        }

        results.forEach(function(item, index) {


            var countrymesh = that.decorators[0].findCountry(item[search], search);

            if (!countrymesh) {
                console.log('Country ' + (item.countrycode || item.countryname) + ' is not available ');
                return;
            }

            // console.log(countrymesh.userData.name, ' ' + item.value + '%');

            var obj = {};
            obj.mesh = countrymesh;
            obj.color = countrymesh.material.color.getHex();
            if (item.value) obj.value = item.value;

            if (item.category) obj.category = item.category;

            countrymesh.material.color.r = 1;
            countrymesh.material.color.g = 1 - colorsMap[item.value];
            countrymesh.material.color.b = 1 - colorsMap[item.value];

            obj.result_color = countrymesh.material.color.getHex();

            that.added.push(obj);

        });
    },
    sortResultsByCategory: function() {

        var that = this;

        Application.BaseGlobeView.prototype.sortResultsByCategory.call(this);

       // this.resetGlobe();
        this.showAllResults();

       // if (category == 'All') return;

       if (this.activeCategories.length != 0) {
       $.each(this.added, function(index, country) { // turn all added countries grey

                country.mesh.material.color.r = 0.5;
                country.mesh.material.color.g = 0.5;
                country.mesh.material.color.b = 0.5;

        });
   }

    $.each(this.activeCategories, function(i, category) {

        $.each(that.added, function(i, country) {

            if (country.category == category) {

                country.mesh.material.color.setHex(country.result_color);

                console.log(i++);
            }

        });

    });

},
showAllResults: function() {

    Application.BaseGlobeView.prototype.showAllResults.call(this);

    this.resetGlobe();

    $.each(this.added, function(index, country) {

        country.mesh.material.color.setHex(country.result_color);

    });
},

});
