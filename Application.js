
require(['SourceCode/Views/GlobeView', 'SourceCode/Models/GlobeModel'], function() {
	require(['SourceCode/Controllers/GlobeController'], function() {
	    var Application = Backbone.View.extend({
	        initialize: function(options) {
	            this.globeController = new GlobeController();
	        },
	        main: function() {
	            this.globeController.presentGlobe();
	        }
	    });

	    var application = new Application();
		application.main();
	});
});
