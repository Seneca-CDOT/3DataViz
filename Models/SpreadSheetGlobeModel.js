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

    },
    preParse: function() {

        var data = {};
        Application._vent.trigger('data/parsed', this.getViewConfigs(data));

    },
    parse: function(response) {

        // console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;

        var options = {

            dataType: "spreadSheet",
            visualizationType: this.templatesList
        };

        var that = this;
        pModule.processData(response, options, function(response){
            console.log("parse:",response);
            that.transform(response); 
            // that.models = data;
            // Application._vent.trigger('data/ready');
        });

    },
    transform: function(data){
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            visualizationType: Application.userConfig.vizLayer
        }

        pModule.transformData(data, options, function(response){
            console.log("transform:",response);
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
        for (var i = 0; i < this.models.length; i++) {
            this.models[i] = null;
        }
    },
    getViewConfigs: function(data) {
        var defaults = {
            vizType: {
                name: 'vizType',
                list: ['geometry', 'texture']
            },
            vizLayer: {
                name: 'vizLayer',
                list: ['points','countries', 'graph']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);
    }

});
