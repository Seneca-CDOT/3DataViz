var Application = Application || {};

// google trends

Application.GoogleTrendsRecord = Application.BaseDataRecord.extend({

    defaults: _.extend({}, Application.BaseDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.BaseDataRecord.prototype.initialize.call(this);
    }

});

Application.GoogleTrendsCollection = Application.BaseGlobeCollection.extend({
    model: Application.GoogleTrendsRecord,
    initialize: function(obj) {
        Application.BaseGlobeCollection.prototype.initialize.call(this);

        this._event = obj._event;
        this.response; // response from google trends
        var that = this;

        window.google = {
            visualization: {

                Query: {

                    setResponse : function(data) {

                        that.response = data;
                        that._event.trigger('trends/changed');
                    }
                }
            }
        }
        this._event.on('trends/changed', this.parse.bind(this));
    },
    parse: function() {

        var collection = this;

        $.each(this.response.table.rows, function(index, value) {

            var obj = {};
            obj.countrycode = value.c[0].v; // country code
            obj.percent = value.c[1].v; // percentage
            collection.push(obj);

        });

         this._event.trigger('trends/parsed', this.models );
    },
    setURL: function(key) {

        if (!key) return;
        this.url = 'http://www.google.com/trends/fetchComponent?q=' + key + '&cid=GEO_TABLE_0_0&export=3';
    },
    request: function () {
   
     var that = this;
       
        var fileref=document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", this.url);
        document.getElementsByTagName("head")[0].appendChild(fileref);

        }
});

// spread sheet

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
