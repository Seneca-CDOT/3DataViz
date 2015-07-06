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

Application.TweetsLive = Application.BaseGlobeCollection.extend({

    model: Application.Tweet,
    initialize: function(config) {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
        this.track = Application.userConfig.input;
        this.ws;
        this.count = 0;
    },
    parse: function() {

        var data = {};
        Application._vent.trigger('data/parsed', this.getViewConfigs(data));
    },
    parseAll: function(response) {

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {
            dataType: "twitter",
            visualizationType: this.templatesList
        };
        var that = this;
        pModule.processData(response, options, function(data) {
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
            pModule.transformData(pData, options, function(response) {
                that.add(response);
            });
        }
    },
    fetch: function() {
        this.parse();
    },
    fetchAll: function() {
        this.destroy();
        this.ws = new WebSocket("ws://threedataviz.herokuapp.com/");
        var that = this;
        this.ws.onopen = function() {
            var msg = {
                type: "start",
                dataSource: "twitterLive",
                track: that.track
            }
            Application._vent.trigger('controlpanel/message/on', 'AWAITING TWEETS');
            that.ws.send(JSON.stringify(msg));
            Application._vent.trigger('data/ready');
        };
        this.ws.onmessage = function(results) {
            Application._vent.trigger('controlpanel/message/off');
            var obj = JSON.parse(results.data).data;
            obj.real_timestamp = obj.timestamp_ms; // timestamp of the tweet emitted
            obj.timestamp_ms = new Date().getTime();
            that.parseAll([obj]);
        };
        this.ws.onclose = function(close) {
            this.ws = null;
        }
    },
    destroy: function() {
        // console.log("Destroy Tweets");
        for (var i = 0; i < this.models.length; i++) {
            this.models[i].destroy();
        }
        if (this.ws) {
            // console.log("WebSocket disconnected");
            this.ws.send(JSON.stringify({
                type: "stop",
                dataSource: "twitterLive"
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
