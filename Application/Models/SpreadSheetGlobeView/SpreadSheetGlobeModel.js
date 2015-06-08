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
        // this.url = '';
        // this.templatesList = config.templatesList;
        Application.BaseGlobeCollection.prototype.initialize.call(this);

    },
    parse: function(response) {

        var that = this;
        // console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;

        var options = {

            dataType: "spreadSheet",
            visualizationType: this.templatesList
        };

        var pData = pModule.processData(response, options);

        // Application._vent.trigger('data/ready', pData);
        Application._vent.trigger('data/parsed', pData);

        that.models = pData;

    },
    setURL: function(key) {

        if (!key) return;
        this.url = 'https://spreadsheets.google.com/feeds/cells/' + key + '/1/public/basic?alt=json';
    }
});