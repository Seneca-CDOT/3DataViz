var Application = Application || {};

/**
 * RootGlobeView:
 * Create common views
 * @return this element
 */
Application.RootGlobeView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#rootGlobeViewTemplate").html()),

    initialize: function(config) {

        console.log("initialize");

        this.obj = {};
        //this.globeView = {};
        this.obj.collection = [];
        this.obj.decorators = [];
        this.obj.config = config;
        this.createDecorators(config);
        this.createCollection(config);

        Application._vent.on('controlpanelsubview/visualize', this.createGlobeView.bind(this.obj));
    },
    render: function() {

        var options = {
            origin: {
                x: 0,
                y: 0
            },
            size: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        this.globeView.options = options;

        this.$el.append(this.globeView.render().$el);
        return this;
    },
    destroy: function() {

        this.remove();
        this.unbind();
        this.obj.collection = null;
        this.obj.decorators = null;
        this.obj.config = null;
        this.obj = null;
        this.globeView.destroy();
        this.globeView = null;
    },

    createGlobeView: function(obj) {

        console.log("createGlobeView");
        console.log(obj);
        var rootGlobeViewClass = null;
        switch (obj.config.templatesList) {

            case "countries":
                {
                    // files = Application.globeViews.googleTrends.files;
                    rootGlobeViewClass = 'GoogleTrendsGlobeView';
                    // rootGlobeViewClass = 'SpreadSheetRootGlobeView';
                    break;
                }
            case "points":
                {
                    //files = Application.globeViews.spreadSheet.files;
                    //rootGlobeViewClass = 'GoogleTrendsRootGlobeView';
                    rootGlobeViewClass = 'SpreadSheetGlobeView';
                    break;
                }
            case "dynamic":
                {
                    // files = Application.globeViews.dynamic.files;
                    rootGlobeViewClass = 'DynamicGlobeView';
                    break;
                }
            case "graph":
                {
                    // files = Application.globeViews.flightPath.files;
                    rootGlobeViewClass = 'FlightPathGlobeView';
                    break;
                }
        }

        var that = this;
        require(Application.layers[obj.config.templatesList], function() {

            that.globeView = new Application[rootGlobeViewClass](obj);
            that.render();
        });

    },
    createCollection: function(config) {

        console.log("createCollection");
        console.log(config);
        var collection = [];
        var collectionClasses = [];
        var files = [];
        var that = this;
        switch (config.dataSourcesList) {

            case 'twitter':
                {

                    collectionClasses = ['Tweets'];
                    //files = ['Models/DynamicGlobeView/DynamicGlobeModel.js'];
                    break;

                }
            case 'csv':
                {

                    collectionClasses = ['AirportsCollection', 'AirportRoutesCollection'];
                    //files = ['Models/FlightPathGlobeView/FlightPathGlobeModel.js'];
                    break;
                }
            case 'spreadSheet':
                {

                    collectionClasses = ['SpreadSheetCollection'];
                    // files = ['Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js'];
                    break;

                }
            case 'googleTrends':
                {

                    collectionClasses = ['GoogleTrendsCollection'];
                    //  files = ['Models/GoogleTrendsGlobeView/GoogleTrendsGlobeModel.js'];
                    break;
                }

        }

        require(Application.models[config.dataSourcesList], function() {

            $.each(collectionClasses, function(index, collectionName) {

                collection.push(new Application[collectionName](config));

            });

            that.obj.collection = collection;

            $.each(that.obj.collection, function(index, collection){
                collection.fetch();
            });

            // that.createGlobeView(that.obj);

        });

    },
    createDecorators: function(config) {

        console.log("createDecorators");
        console.log(config);
        var decorators = [];
        var decorator = Application.GlobeDecoratorFactory.createDecorator(config)

        this.obj.decorators = [decorator];
    }
});