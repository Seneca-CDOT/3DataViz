require(['SourceCode/Views/GlobeView', 'SourceCode/Models/GlobeModel'], function() {
	require(['SourceCode/Controllers/GlobeController'], function() {

	    var Application = Backbone.View.extend({
	    	el: $("#applicaitonRegion"),
	        initialize: function(options) {
	            this.rootGlobeController = new RootGlobeController();
	        },
	        render: function(options) {
				this.$el.append(this.rootGlobeController.getRootGlobeView().$el);
				this.rootGlobeController.getRootGlobeView().render();
				return this;
	        }
	    });

	    var application = new Application();
	    application.render();
	});
});
