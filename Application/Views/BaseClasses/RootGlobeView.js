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

        var obj = {};
        obj.collection = this.createCollection(config);
        obj.decorators = this.createDecorators(config);
        this.globeView = this.createGlobeView(obj);
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

    createGlobeView: function(config) {

        return null;
    },
    createCollection: function(config) {

        return null;
    },
    createDecorators: function(config) {

        var decorators = [];
        var decorator = Application.GlobeDecoratorFactory.createDecorator(config)

        return [decorator];
    }
});