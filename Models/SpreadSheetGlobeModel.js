var Application = Application || {};

Application.SpreadSheetRecord = Application.GeoDataRecord.extend({

    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }

});

Application.SpreadSheetCollection = Application.BaseGlobeCollection.extend({
    model: Application.SpreadSheetRecord,
    initialize: function(config) {

        this.setURL(Application.userConfig.input);
        Application.BaseGlobeCollection.prototype.initialize.call(this);
        this.data = null; // holds data from parsing stage

    },
    parse: function(response) {

        var that = this;
        // console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;

        var options = {

            dataType: "spreadSheet",
            visualizationType: this.templatesList
        };

        pModule.processData(response, options, {

            preparsed: function(headers) {
                // console.log("preparsed:", headers);
                headers = _.values(headers);
                Application._vent.trigger('matcher/user', headers);
                Application._vent.trigger('matcher/on');
            },
            complete: function(response) {
                // console.log("parse:", response);
                that.data = response; // to hold data until visualization starts
            }

        });

    },
    transform: function() {

        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;

        var options = {
            visualizationType: Application.userConfig.template
        }

        pModule.transformData(this.data, options, function(response) {
            console.log("transform:", response);
            that.models = response;
            Application._vent.trigger('data/ready');
        });
    },
    setURL: function(key) {

        if (!key) return;
        this.url = 'https://spreadsheets.google.com/feeds/cells/' + key + '/1/public/basic?alt=json';
    },
    destroy: function() {
        // console.log("Destroy SpreadSheetCollection");
        Application.BaseGlobeCollection.prototype.destroy.call(this);
    },
});
