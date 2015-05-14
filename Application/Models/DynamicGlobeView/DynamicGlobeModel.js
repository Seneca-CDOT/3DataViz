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
    url: "tweets/apple",
    initialize: function() {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
    },
    parse: function(response) {

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {

            dataType: "tweet"
        };
        var pData = pModule.processData(response, options)
        return pData;
        
    }
});
