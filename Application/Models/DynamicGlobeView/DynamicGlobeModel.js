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
    url: "https://threedataviztest2.herokuapp.com/tweets/apple",
    initialize: function(config) {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
        this.templatesList = config.templatesList;
    },
    parse: function(response) {

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {

            dataType: "twitter",
            visualizationType: this.templatesList
        };
        var pData = pModule.processData(response, options)

        Application._vent.trigger('data/ready', pData);
        
    }
});
