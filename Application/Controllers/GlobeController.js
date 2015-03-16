
// Controller

// TODO: subclass another class
var BaseGlobeController = Backbone.View.extend({
	initialize: function(options) {
	}
});

var RootGlobeController = BaseGlobeController.extend({
	initialize: function(options) {
		BaseGlobeController.prototype.initialize.call(this, options);
		this.rootGlobeView = new RootGlobeView();
	},
	getRootGlobeView: function() {
		return this.rootGlobeView;
	}
});
