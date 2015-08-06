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
        this.data = null;

    },
    parse: function() {

        // console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            dataType: "csv"
        };

        pModule.processData(this.file, options, {

            preparsed: function(headers) {
                // console.log("preparsed:", headers);
                Application._vent.trigger('matcher/user', headers);
                Application._vent.trigger('matcher/on');
            },
            complete: function(response) {
                // console.log("parse:", response);
                that.data = response; // to hold data until visualization starts
            }

        });

    },
    transform: function(){
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            visualizationType: Application.userConfig.template
        }

        pModule.transformData(this.data, options, function(response){
            // console.log("transform:",response);
            that.models = response;
            Application._vent.trigger('data/ready');
        });
    },
    fetch: function() {
        this.parse();
    },
    destroy: function() {
       // console.log("Destroy SpreadSheetCollection");
       Application.BaseGlobeCollection.prototype.destroy.call(this);
   },

});
