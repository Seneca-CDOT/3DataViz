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
        this.ws;
        this.count = 0;
    },
    preParse: function() {
        var tweet = {
            geo: {
                coordinates: ['', '']
            },
            text: '',
            timestamp_ms: ''
        }
        this.parse([tweet]);
    },
    parse: function(response) {
        if (this.count++ == 0) {
            Application._vent.trigger('data/parsed', this.getViewConfigs(response));
        }
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
    },
    fetch: function() {

        console.log('userconf', Application.userConfig);
        var that = this;
        this.ws = new WebSocket("ws://threedataviz.herokuapp.com/");

        this.ws.onopen = function() {

            var msg = {
                    type: "start",
                    dataSource: Application.userConfig.dataSource,
                    keyword: Application.userConfig.input,
                    interval: '',
                    timeFrom: Application.Helper.convertDateTimeToStamp(Application.userConfig.timeFrom),
                    timeTo: Application.Helper.convertDateTimeToStamp(Application.userConfig.timeTo)
                }
            console.log(msg, JSON.stringify(msg));
            that.ws.send(JSON.stringify(msg));
        };
        this.ws.onmessage = function(results) {
            console.log('twit obj: ', results);
            var obj = JSON.parse(results.data);
            obj.real_timestamp = obj.timestamp_ms; // timestamp of the tweet emitted
            obj.timestamp_ms = new Date().getTime();
            that.parse([obj]);
        };
        this.ws.onclose = function(close) {
            this.ws = null;
        }
    },
    destroy: function() {
        console.log("Destroy Tweets");
        for (var i = 0; i < this.models.length; i++) {
            this.models[i].destroy();
        }
        if (this.ws) {
            console.log("WebSocket disconnected");
            this.ws.send(JSON.stringify({
                type: "stop",
                dataSource: "twitterDB"
            }));
            this.ws.close();
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
                list: ['dynamic']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);
    }

});
