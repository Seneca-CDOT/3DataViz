var Application = Application || {};

Application.SpreadSheetRecord = Application.GeoDataRecord.extend({

    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {

    }),
    initialize: function(_vent) {
        Application.GeoDataRecord.prototype.initialize.call(this);
        this._vent = _vent;
    }

});

Application.SpreadSheetCollection = Application.BaseGlobeCollection.extend({
    model: Application.SpreadSheetRecord,
    initialize: function(config) {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
        this.setURL(config.userInput);
        this.templatesList = config.templatesList;

    },
    parse: function(response) {
        console.log("SpreadSheet Parse");
        console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;
        
        var options = {

            dataType: "spreadSheet",
            visualizationType: this.templatesList
        };
        
        var pData = pModule.processData(response, options);
        
        return pData;
    },

    setURL: function(key) {
        if (!key) return;
        this.url = 'https://spreadsheets.google.com/feeds/cells/' + key + '/1/public/basic?alt=json';
    }
});