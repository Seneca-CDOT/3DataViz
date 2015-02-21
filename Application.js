
require(['SourceCode/Views/GlobeView', 'SourceCode/Models/GlobeModel'], function() {
	require(['SourceCode/Controllers/GlobeController'], function() {

		// TODO: Application IS NOT a view, 
		// thus cannot be inheretied 
		// from Backbone.View class.

	    var Application = Backbone.View.extend({
	        initialize: function() {
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
