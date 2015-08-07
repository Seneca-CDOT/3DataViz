var Application = Application || {};

Application.CountriesLayer = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(decorator, collections) {

        Application.BaseGlobeView.prototype.initialize.call(this, decorator, collections);

        this.added = []; // list of countries participating and their old colors

        Application._vent.on('run', this.resetGlobe, this);

    },
    render: function() {

        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    },
    clickOn: function(event) {

        //  this.inter();

        var intersectedMesh = Application.BaseGlobeView.prototype.clickOn.call(this, event);

        var found = false;

        var sign = '';

         if (Application.userConfig.model == 'googleTrends') sign = '%';

        if (intersectedMesh) {

            $.each(this.added, function(index, country) {

                if (intersectedMesh.object == country.mesh) {

                    Application._vent.trigger('vizinfocenter/message/on', country.mesh.userData.name +
                        '<br>' + Application.Helper.formatNumber(country.value) + sign );
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

    //    that.changeCountryColor(country.mesh.material.color, country.color, country.mesh);

          country.mesh.material.color.setHex(country.color);

        });
    },
    changeCountryColor: function(from, to, mesh) {

      var t =  new TWEEN.Tween(from).to(to, 1000);

      t.easing( TWEEN.Easing.Exponential.Out );

      t.onUpdate(function(){

        mesh.material.color.copy(this);

      });

      t.start();
    },
    getColor: function(cur, min, max) {

       if (Application.userConfig.model == 'googleTrends') {
         min = 0; max = 100;
        }

        var x = cur - min;
        var y = max - min;
        var value = x / y;

        return this.percentToRGB(value*100);

    },
      percentToRGB:  function(percent) { // from yellow to red
        if (percent === 100) {
            percent = 99
        }
        var r, g, b;
        //
        // if (percent < 50) {
        //     // green to yellow
        //     r = Math.floor(255 * (percent / 50));
        //     g = 255;
        //
        // } else {
            // yellow to red
            r = 255;
            g = Math.floor(255 * ((100 - percent) / 50));
          //  console.log(percent);
        // }
        b = 0;
        // return "rgb(" + r + "," + g + "," + b + ")";
        return { r: r/255, g: g/255, b: b/255 };
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

        this.getCategories(results);
        Application.BaseGlobeView.prototype.showResults.call(this, results);

        Application._vent.trigger('title/message/on', Application.userConfig.templateTitle);

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        } else if (!(results[0].country)) {
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }

        Application._vent.trigger('controlpanel/message/off');

        results.sort(function(a, b) { // sorts array in ascending order by value
            return a.value - b.value
        });

        var colorsMap = this.createColors(results); // creates a colors map relative to the values

        results.forEach(function(item, index) {

            var countrymesh = that.decorators[0].findCountry(item.country);

            if (!countrymesh) {
                // console.log('Country ' + (item.countrycode || item.countryname) + ' is not available ');
                return;
            }

            // console.log(countrymesh.userData.name, ' ' + item.value + '%');

            var obj = {};
            obj.mesh = countrymesh;
            obj.color = countrymesh.material.color.clone();
            if (item.value) obj.value = item.value;
            // console.log(countrymesh.userData.name)

            if (item.category) obj.category = item.category;

            // countrymesh.material.color.r = 1;
            // countrymesh.material.color.g = 1 - colorsMap[item.value];
            // countrymesh.material.color.b = 1 - colorsMap[item.value];
            //countrymesh.material.color.set(colorsMap[item.value]);

            that.changeCountryColor(countrymesh.material.color, colorsMap[item.value], countrymesh);

            obj.result_color = countrymesh.material.color.clone();

            that.added.push(obj);

        });
    },
    sortResultsByCategory: function() {

        var that = this;

        Application.BaseGlobeView.prototype.sortResultsByCategory.call(this);

        this.resetGlobe();
      //  this.showAllResults();

       // if (category == 'All') return;

      //  if (this.activeCategories.length != 0) {
  //
  //      $.each(this.rayCatchers, function(index, country) { // turn all added countries grey
  //            if (country == that.globe) return;
   //
  //               that.changeCountryColor(country.material.color, { r: 0.5, g: 0.5, b: 0.5 }, country);
  //       });
  //  }

    $.each(this.activeCategories, function(i, category) {

        $.each(that.added, function(i, country) {

            if (country.category == category) {

                that.changeCountryColor(country.mesh.material.color, country.result_color, country.mesh)
            //    country.mesh.material.color.setHex(country.result_color);

                // console.log(i++);
            }

        });

    });

},
showAllResults: function() {

    Application.BaseGlobeView.prototype.showAllResults.call(this);

    this.resetGlobe();

    $.each(this.added, function(index, country) {

        this.changeCountryColor(country.mesh.material.color, country.result_color, country.mesh)

    });
},

});
