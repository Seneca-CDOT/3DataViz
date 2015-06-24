var Application = Application || {};

Application.CSVRecord = Application.GeoDataRecord.extend({

    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }

});

Application.CSVCollection = Application.BaseGlobeCollection.extend({
    model: Application.CSVRecord,
    initialize: function(config) {

        this.file = Application.userConfig.files;
        Application.BaseGlobeCollection.prototype.initialize.call(this);

    },
    preParse: function() {

        var that = this;
        Papa.parse(this.file, {
            preview: 1,
            header: true,
            complete: function(response){
                console.log("Preparse:", response.data);
                Application._vent.trigger('data/parsed', that.getViewConfigs(response.data));
            }
        });

    },
    parse: function(file) {

        // console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            dataType: "csv"
        };

        pModule.processData(this.file, options, function(response){
            console.log("parse:",response);
            that.transform(response.data); 
        });

    },
    transform: function(data){
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            visualizationType: Application.userConfig.vizLayer
        }

        pModule.transformData(data, options, function(response){
            that.models = response.data;
            console.log("transform:",response);
            Application._vent.trigger('data/ready'); 
        });
    },
    fetch: function() {
        this.parse();
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
                list: ['graph']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);

    }

});
