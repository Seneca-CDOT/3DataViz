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
    initialize: function() {
        Application.BaseGlobeCollection.prototype.initialize.call(this);

        this.response = []; // response from google trends
        this.url = ''; // request by this url to google trends
        var that = this;
        //this.config = config;
        //this.templatesList = config.templatesList;

        window.google = {
                visualization: {

                    Query: {

                        setResponse: function(data) {

                            that.parse(data);
                        }
                    }
                }
            }

    },
    parse: function(response) {

        var that = this;

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {

            dataType: "googleTrends",
            visualizationType: this.templatesList
        };
        var pData = pModule.processData(response.table.rows, options)

        // Application._vent.trigger('data/ready', pData);
        Application._vent.trigger('data/parsed', this.getViewConfigs(pData));
        
        that.models = pData;
       // return that.models;

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
    fetch: function () {

            if (Application.userConfig.input == '') return;
            this.setURL(Application.userConfig.input);
            this.request();

    },
    getViewConfigs: function(data){
        var defaults = {
            vizType: {
                name: 'vizType',
                list: ['geometry']
            },
            vizLayer: {
                name: 'vizLayer',
                list: ['countries']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);
    }
});