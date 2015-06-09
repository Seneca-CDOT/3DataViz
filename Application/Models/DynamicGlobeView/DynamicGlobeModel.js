var Application = Application || {};

// dynamic twitter

Application.Tweet = Application.GeoDataRecord.extend({

    defaults: {
        text: "",
    },
    initialize: function() {

        Application.GeoDataRecord.prototype.initialize.call(this);
    }
});

Application.Tweets = Application.BaseGlobeCollection.extend({

    model: Application.Tweet,
    url: "http://threedataviz.herokuapp.com/tweets/apple",
    initialize: function(config) {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
        // this.templatesList = config.templatesList;
        this.track = Application.userConfig.input;
        this.ws;
    },
    parse: function(response) {

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {
            dataType: "twitter",
            visualizationType: this.templatesList
        };
        var pData = pModule.processData(response, options);
        this.transform(pData);
    },
    transform: function(pData){
        if(Application.userConfig.vizLayer == ""){
            this.add(pData);

        }else{
            var pModule = Application.DataProcessor.ProcessorModule;
            var options = {
                visualizationType: Application.userConfig.vizLayer
            };
            pData = pModule.transformData(pData, options);

            this.add(pData);
        }
        Application._vent.trigger('data/parsed', this.getViewConfigs(pData));
    },
    fetch: function () {

        console.log("WebSocket connected to ws://threedataviz.herokuapp.com");
        this.ws = new WebSocket("ws://threedataviz.herokuapp.com");
        var that = this;
        this.ws.onopen = function(){
            var msg = {
              type: "start",
              track: that.track
            }
            console.log("Get live tweets of the keyword \'"+ that.track +"\'");
            that.ws.send(JSON.stringify(msg));
        };
        this.ws.onmessage = function(results){
            that.parse([JSON.parse(results.data).data]);
        };
        this.ws.onclose = function(close){
            this.ws = null;
        }
    },
    disconnect: function(){
        if(this.ws){
            console.log("WebSocket disconnected");
            this.ws.send(JSON.stringify({type:"stop"}));
            this.ws.close();
        }
    },
    getViewConfigs: function(data){
        var defaults = {
            vizType: {
                name: 'vizType',
                list: ['geometry', 'texture']        
            },
            vizLayer: {
                name: 'vizLayer',
                list: ['dynamic']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);
    }

});
