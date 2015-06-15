var Application = Application || {};

Application.GoogleTrendsRootGlobeView = Application.RootGlobeView.extend({
    initialize: function(config) {

        Application.RootGlobeView.prototype.initialize.call(this, config);
    },
    render: function(options) {

        Application.RootGlobeView.prototype.render.call(this);
        return this;
    },
    createCollection: function(config) {

        return new Application.GoogleTrendsCollection(config);
    },
    createGlobeView: function(config) {

        return new Application.GoogleTrendsGlobeView(config);
    }
});