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

        this.$el.attr("id", "rootGlobe");
        this.obj = {};
        this.collections = collections;
        this.obj.decorators = [];
        var decorator = this.createDecorators(Application.userConfig.decorator);
        this.createGlobeView(Application.userConfig.template, decorator, collections);

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
        require(Application.templates[layer].url, function() {
            that.globeView = new Application[rootGlobeViewClass](decorator, collections);
            that.render();
        });

    },
    createDecorators: function(config) {

        var decorators = [];
        var decorator = Application.GlobeDecoratorFactory.createDecorator(config)

        return [decorator];
    }
});
