var Application = Application || {};

/**
 * RootVisualizationView:
 * Create common views
 * @return this element
 */
Application.RootVisualizationView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#rootVisualizationViewTemplate").html()),

    initialize: function(collections) {

        //  console.log("initialize RootVisualizationView");
        this.$el.attr("id", "rootVisualization");
        this.obj = {};
        this.collections = collections;
        this.obj.decorators = [];
        var decorator = this.createDecorators(Application.userConfig.vizType);
        this.createView(Application.userConfig.vizLayer, decorator, collections);

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
        this.view.options = options;

        this.$el.append(this.view.render().$el);
        return this;
    },
    destroy: function() {

        this.remove();
        this.unbind();
        this.collections = null;
        this.obj.decorators = null;
        //this.obj.config = null;
        this.obj = null;
        this.view.destroy();
        this.view = null;

    },
    visualize: function(config) {
        
        this.createDecorators(config);
        this.createView(this.obj);

    },
    createView: function(layer, decorator, collections) {

        var rootViewClass = null;
        switch (layer) {

            case "countries":
                {
                    rootViewClass = 'CountriesLayer';
                    break;
                }
            case "points":
                {
                    rootViewClass = 'PointsLayer';
                    break;
                }
            case "dynamic":
                {
                    rootViewClass = 'DynamicLayer';
                    break;
                }
            case "graph":
                {
                    rootViewClass = 'GraphsLayer';
                    break;
                }
            case "pointcloud":
                {
                    rootViewClass = 'PointCloudLayer';
                    break;
                }
        }

        var that = this;
        require(Application.layers[layer], function() {
            that.view = new Application[rootViewClass](decorator, collections);
            that.render();
        });

    },
    createDecorators: function(config) {

        var decorators = [];
        // var decorator = Application.DecoratorFactory.createDecorator(config)
        // Application._vent.trigger('globe/ready');
        // return [decorator];
        return null;
    }
});
