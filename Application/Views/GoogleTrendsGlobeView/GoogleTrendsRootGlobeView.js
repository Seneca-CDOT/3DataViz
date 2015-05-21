var Application = Application || {};

Application.GoogleTrendsRootGlobeView = Application.RootGlobeView.extend({
    initialize: function(config) {

        Application.RootGlobeView.prototype.initialize.call(this, config);
        // var obj = {};
        // obj.collection = new Application.GoogleTrendsCollection();
        // this.globeView = new Application.GoogleTrendsGlobeView(obj);
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