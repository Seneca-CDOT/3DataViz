var Application = Application || {};

/**
 * RootGlobeView:
 * Create common views
 * @return this element
 */
Application.RootGlobeView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#rootGlobeViewTemplate").html()),

    initialize: function(collections) {

        //  console.log("initialize RootGlobeView");
        this.$el.attr("id", "rootGlobe");
        this.obj = {};
        this.collections = collections;
        this.obj.decorators = [];
        var decorator = this.createDecorators(Application.userConfig.vizType);
        this.createGlobeView(Application.userConfig.vizLayer, decorator, collections);
        // this.createCollection(config);

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
        this.collections = null;
        this.obj.decorators = null;
        //this.obj.config = null;
        this.obj = null;
        this.globeView.destroy();
        this.globeView = null;

    },
    visualize: function(config) {
        this.createDecorators(config);
        this.createGlobeView(this.obj);
    },
    createGlobeView: function(layer, decorator, collections) {

        var rootGlobeViewClass = null;
        switch (layer) {

            case "countries":
                {
                    rootGlobeViewClass = 'CountriesLayer';
                    break;
                }
            case "points":
                {
                    rootGlobeViewClass = 'PointsLayer';
                    break;
                }
            case "dynamic":
                {
                    rootGlobeViewClass = 'DynamicLayer';
                    break;
                }
            case "graph":
                {
                    rootGlobeViewClass = 'GraphsLayer';
                    break;
                }
        }

        var that = this;
        require(Application.layers[layer], function() {
            that.globeView = new Application[rootGlobeViewClass](decorator, collections);
            that.render();
        });

    },
    // createCollection: function(config) {

    //     console.log("createCollection");
    //     console.log(config);
    //     var collection = [];
    //     var collectionClasses = [];
    //     var files = [];
    //     var that = this;
    //     switch (config.dataSourcesList) {

    //         case 'twitter':
    //             {

    //                 collectionClasses = ['Tweets'];
    //                 //files = ['Models/DynamicLayer/DynamicGlobeModel.js'];
    //                 break;

    //             }
    //         case 'csv':
    //             {

    //                 collectionClasses = ['AirportsCollection', 'AirportRoutesCollection'];
    //                 //files = ['Models/GraphsLayer/FlightPathGlobeModel.js'];
    //                 break;
    //             }
    //         case 'spreadSheet':
    //             {

    //                 collectionClasses = ['SpreadSheetCollection'];
    //                 // files = ['Models/PointsLayer/SpreadSheetGlobeModel.js'];
    //                 break;

    //             }
    //         case 'googleTrends':
    //             {

    //                 collectionClasses = ['GoogleTrendsCollection'];
    //                 //  files = ['Models/CountriesLayer/GoogleTrendsGlobeModel.js'];
    //                 break;
    //             }

    //     }

    //     require(Application.models[config.dataSourcesList], function() {

    //         $.each(collectionClasses, function(index, collectionName) {

    //             collection.push(new Application[collectionName](config));

    //         });

    //         that.obj.collection = collection;

    //         $.each(that.obj.collection, function(index, collection){
    //             collection.fetch();
    //         });
    //         // that.createGlobeView(that.obj);

    //     });

    // },
    createDecorators: function(config) {

        var decorators = [];
        var decorator = Application.GlobeDecoratorFactory.createDecorator(config)

        return [decorator];
    }
});
