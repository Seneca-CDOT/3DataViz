
require(['SourceCode/Views/GlobeView', 'SourceCode/Models/GlobeModel'], function() {
	require(['SourceCode/Controllers/GlobeController'], function() {

	    var Application = Marionette.Application.extend({
	    	regions: {
				applicationRegion: "#applicaitonRegion"
			},	
	        initialize: function() {
	            this.rootGlobeController = new RootGlobeController();
	        },
	        onBeforeStart: function() {
	
	        },
	        onStart: function() {
	            var rootGlobeView = this.rootGlobeController.getRootGlobeView();
	            this.applicationRegion.show(rootGlobeView);
	        }
	    });

	    var application = new Application();
	    application.start();
	});
});
