var Application = Application || {};

Application.DynamicRootGlobeView = Application.RootGlobeView.extend({

    initialize: function(config) {

        Application.RootGlobeView.prototype.initialize.call(this, config);
    },
    render: function(options) {

        Application.RootGlobeView.prototype.render.call(this);
        return this;
    },

    createCollection: function(config) {

        return new Application.Tweets();
    },
    createGlobeView: function(config) {

        return new Application.DynamicGlobeView(config);
    }
});
