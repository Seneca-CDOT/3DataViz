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

        this.data = null; // holds data from google trends
        this.url = ''; // request by this url to google trends
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

    },
    parse: function(response) {

        var that = this;

        var pModule = Application.DataProcessor.ProcessorModule;
        var options = {

            dataType: "googleTrends",
            visualizationType: this.templatesList
        };

        pModule.processData(response.table.rows, options, function(response) {
                console.log("parse:", response);
                Application._vent.trigger('data/parsed');
                //that.transform(response);
                that.data = response; // to hold data until visualization starts
            });
    },
    transform: function() {
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            visualizationType: Application.userConfig.template
        }
        //pModule.transformData(this.data, options, function(response) {
            console.log("transform:", this.data);
            that.models = this.data;
            Application._vent.trigger('data/ready');
       // });
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
        var test = document.getElementsByTagName("head")[0].appendChild(fileref);

    },
    fetch: function() {

        if (Application.userConfig.input == '') return;
        this.setURL(Application.userConfig.input);
        this.request();

    },
    destroy: function() {
        //  console.log("Destroy GoogleTrendsCollection");
       Application.BaseGlobeCollection.prototype.destroy.call(this);
    },
    getViewConfigs: function(data) {
        var defaults = {
            decorator: {
                name: 'decorator',
                list: ['geometry']
            },
            template: {
                name: 'template',
                list: ['countries']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);
    }
});
