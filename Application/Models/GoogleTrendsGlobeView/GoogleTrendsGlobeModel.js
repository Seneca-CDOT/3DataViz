var Application = Application || {};

Application.GoogleTrendsRecord = Application.BaseDataRecord.extend({

    defaults: _.extend({}, Application.BaseDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.BaseDataRecord.prototype.initialize.call(this);
    }

});

Application.GoogleTrendsCollection = Application.BaseGlobeCollection.extend({
    model: Application.GoogleTrendsRecord,
    initialize: function(config) {
        Application.BaseGlobeCollection.prototype.initialize.call(this);

        this.response; // response from google trends
        this.url; // request by this url to google trends
        var that = this;

        window.google = {
                visualization: {

                    Query: {

                        setResponse: function(data) {

                            that.parse(data);
                        }
                    }
                }
            }

           this.initRequest(config);

    },
    parse: function(response) {

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {

            dataType: "googleTrends"
        };
        var pData = pModule.processData(response.table.rows, options)

        Application._vent.trigger('trends/parsed', pData);
    },
    setURL: function(key) {

        if (!key) return;
        this.url = 'http://www.google.com/trends/fetchComponent?q=' + key + '&cid=GEO_TABLE_0_0&export=3';
    },
    request: function() {

        var that = this;

        var fileref = document.createElement('script');
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", this.url);
        document.getElementsByTagName("head")[0].appendChild(fileref);

    },
    initRequest: function (config) {

            if (config.userInput == '') return;
            this.setURL(config.userInput);
            this.request();

    }
});