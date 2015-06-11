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

Application.TweetsDB = Application.BaseGlobeCollection.extend({

    model: Application.Tweet,
    // url: "http://threedataviz.herokuapp.com/twitterDB/apple",
    //url: "twitterDB/apple",
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
        console.log('tweets', response);
        var pData = pModule.processData(response, options);
        this.transform(pData);
    },
    transform: function(pData) {
        if (Application.userConfig.vizLayer == "") {
            this.add(pData);

        } else {
            var pModule = Application.DataProcessor.ProcessorModule;
            var options = {
                visualizationType: Application.userConfig.vizLayer
            };
            pData = pModule.transformData(pData, options);

            this.add(pData);
        }
        Application._vent.trigger('data/parsed', pData);
    },
    fetch: function() {

        console.log('userconf', Application.userConfig);
        var that = this;
        // this.ws = new WebSocket("ws://threedataviz.herokuapp.com/");
        this.ws = new WebSocket("ws://localhost:5000");

        this.ws.onopen = function() {

            var msg = {
                    type: "start",
                    dataSource: Application.userConfig.dataSource,
                    keyword: Application.userConfig.input,
                    timeFrom: Application.Helper.convertDateTimeToStamp(Application.userConfig.timeFrom),
                    timeTo: Application.Helper.convertDateTimeToStamp(Application.userConfig.timeTo)
                }
                //console.log("Get live tweets of the keyword \'"+ that.track +"\'");
                console.log(msg,JSON.stringify(msg));
            that.ws.send(JSON.stringify(msg));
        };
        this.ws.onmessage = function(results) {
            console.log('twit obj: ', results);
            var obj = JSON.parse(results.data);
            obj.timestamp_ms = new Date();
            that.parse([obj]);
        };
        this.ws.onclose = function(close) {
            this.ws = null;
        }
    },
    destroy: function(){
        console.log("Destroy Tweets");
        for(var i=0; i<this.models.length; i++){
            this.models[i].destroy();
        }
        if(this.ws){
            console.log("WebSocket disconnected");
            this.ws.send(JSON.stringify({type:"stop"}));
            this.ws.close();
        }
    },

});