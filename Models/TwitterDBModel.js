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

        var data = {};
        Application._vent.trigger('data/parsed', this.getViewConfigs(data));

    },
    parse: function(response) {

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {
            dataType: "twitter",
            visualizationType: this.templatesList
        };
        console.log('tweets', response);
        var that = this;
        pModule.processData(response, options, function(data){
            that.transform(data);
        });
    },
    transform: function(pData) {
        if (Application.userConfig.vizLayer == "") {
            this.add(pData);

        } else {
            var that = this;
            var pModule = Application.DataProcessor.ProcessorModule;
            var options = {
                visualizationType: Application.userConfig.vizLayer
            };
            pModule.transformData(pData, options, function(response){
                that.add(response);
            });
        }
    },
    fetch: function() {

        this.destroy();
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
            Application._vent.trigger('data/ready');
            Application._vent.trigger('controlpanel/message/on','AWAITING TWEETS');
            console.log(msg, JSON.stringify(msg));
            that.ws.send(JSON.stringify(msg));

        };
        this.ws.onmessage = function(results) {
            console.log('twit obj: ', results);
            if (results.data == '0') {

                Application._vent.trigger('controlpanel/message/on','NO RESULTS RETURNED');
                console.log('no results returned')
                return;
            }
            Application._vent.trigger('controlpanel/message/off');
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
