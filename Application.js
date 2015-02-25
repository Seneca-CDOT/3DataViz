
require(['SourceCode/Views/GlobeView', 'SourceCode/Models/GlobeModel'], function() {
	require(['SourceCode/Controllers/GlobeController'], function() {

	    var Application = Marionette.Application.extend({
	        initialize: function(options) {
	            this.globeController = new GlobeController();
	        },
	        start: function() {
	            this.globeController.presentGlobe();
	        }
	    });

	    var application = new Application();
	    application.start();
	});
});
