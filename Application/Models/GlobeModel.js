var Application = Application || {};

Application.SpreadSheetRecord = Application.GeoDataRecord.extend({

    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }

});

Application.SpreadSheetCollection = Application.BaseGlobeCollection.extend({
    model: Application.SpreadSheetRecord,
    initialize: function() {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
    },
    parse: function(response) {

        // console.log(response);

        var collection = this;

        for (i = 3; i < response.feed.entry.length; i = i + 3) {

            var obj = {};
            obj.city = response.feed.entry[i].content.$t;
            obj.longitude = response.feed.entry[i + 1].content.$t;
            obj.latitude = response.feed.entry[i + 2].content.$t;
            //obj.timestamp = response.feed.entry[i+3].content.$t;
            collection.push(obj);
        }

        return this.models;
    },

    setURL: function(key) {

        if (!key) return;
        this.url = 'https://spreadsheets.google.com/feeds/cells/' + key + '/1/public/basic?alt=json';
    }
});
