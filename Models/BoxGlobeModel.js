var Application = Application || {};

Application.BoxRecord = Application.GeoDataRecord.extend({

    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }

});

Application.BoxCollection = Application.BaseGlobeCollection.extend({
    model: Application.BoxRecord,
    initialize: function(config) {

        var fileInfo = Application.userConfig.fileInfo;
        this.setURL(fileInfo.url);

        var reg = /(?:\.([^.]+))?$/;
        this.fileEx = reg.exec(fileInfo.name)[1];

        Application.BaseGlobeCollection.prototype.initialize.call(this);

    },
    preParse: function() {

        // console.log("preParse");
        var data = {};
        Application._vent.trigger('data/parsed', this.getViewConfigs(data));

    },
    parse: function(dataText) {


        // console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            dataType: this.fileEx
        };

        pModule.processData(dataText, options, function(response){
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
            console.log("transform:",response);
            that.models = response;
            Application._vent.trigger('data/ready'); 
        });
    },
    request: function() {

        var that = this;
        $.ajax({
          url: this.url,
          type: 'GET',
          contentType: false,
          processData: false
        }).complete(function (response){
          that.parse(response.responseText);
        });

    },
    fetch: function() {
        this.request();
    },
    setURL: function(url) {
        if (!url) return;
        this.url = url;
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
                list: ['points', 'countries', 'graph']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);

    }

});
