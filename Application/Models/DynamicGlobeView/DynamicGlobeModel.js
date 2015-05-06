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
        var filter = {
            longitude: "geo.coordinates[1]",
            latitude: "geo.coordinates[0]",
            text: "text",
            timestamp: "timestamp_ms",
        }
        return Application.Filter.extractJSON(filter, response);
    }
});
