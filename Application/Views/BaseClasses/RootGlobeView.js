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

        this.obj = {};
        this.obj.collection = [];
        this.obj.decorators = [];
        this.obj.config = config;
        this.createCollection(config);
        this.globeView = {};
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

        this.globeView.destroy();
    },

    createGlobeView: function(obj) {

        var rootGlobeViewClass = null;
        switch (obj.config.templatesList) {

            case "countries":
                {
                    files = Application.globeViews.googleTrends.files;
                    rootGlobeViewClass = 'GoogleTrendsGlobeView';
                    // rootGlobeViewClass = 'SpreadSheetRootGlobeView';
                    break;
                }
            case "points":
                {
                    files = Application.globeViews.spreadSheet.files;
                    //rootGlobeViewClass = 'GoogleTrendsRootGlobeView';
                    rootGlobeViewClass = 'SpreadSheetGlobeView';
                    break;
                }
            case "dynamic":
                {
                    files = Application.globeViews.dynamic.files;
                    rootGlobeViewClass = 'DynamicGlobeView';
                    break;
                }
            case "graph":
                {
                    files = Application.globeViews.flightPath.files;
                    rootGlobeViewClass = 'FlightPathGlobeView';
                    break;
                }
        }

        var that = this;
        require(files, function() {

            that.globeView = new Application[rootGlobeViewClass](obj);
            //that.$el.prepend(that.globeView.render().$el);
            that.render();
        });

        //  this.globeView = new Application[rootGlobeViewClass](config);
        // return null;
    },
    createCollection: function(config) {

        var collection = [];
        var collectionClasses = [];
        var files = [];
        var that = this;
        switch (config.dataSourcesList) {

            case 'twitter':
                {

                    collectionClasses = ['Tweets'];
                    files = ['Models/DynamicGlobeView/DynamicGlobeModel.js'];
                    break;

                }
            case 'csv':
                {

                    collectionClasses = ['AirportsCollection', 'AirportRoutesCollection'];
                    files = ['Models/FlightPathGlobeView/FlightPathGlobeModel.js'];
                    break;
                }
            case 'spreadSheet':
                {

                    collectionClasses = ['SpreadSheetCollection'];
                    files = ['Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js'];
                    break;

                }
            case 'googleTrends':
                {

                    collectionClasses = ['GoogleTrendsCollection'];
                    files = ['Models/GoogleTrendsGlobeView/GoogleTrendsGlobeModel.js'];
                    break;
                }

        }

        require(files, function() {

            $.each(collectionClasses, function(index, collectionName) {

                collection.push(new Application[collectionName](config));

            });

            that.obj.collection = collection;
            that.obj.decorators = that.createDecorators(config);
            that.globeView = that.createGlobeView(that.obj);

        });

    },
    createDecorators: function(config) {

        var decorators = [];
        var decorator = Application.GlobeDecoratorFactory.createDecorator(config)

        return [decorator];
    }
});