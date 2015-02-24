require(['SourceCode/Views/GlobeView', 'SourceCode/Models/GlobeModel', 'SourceCode/Models/TweetModel', 'SourceCode/Models/OscarsTweets'] , function() {
	require(['SourceCode/Controllers/GlobeController'], function() {
	    // var Application = Backbone.View.extend({
	    //     initialize: function(options) {
	    //         this.globeController = new GlobeController();
	    //     },
	    //     main: function() {
	    //         this.globeController.presentGlobe();
	    //     }
	    // });

	    // var application = new Application();

	    var tweet1 = new Tweet("Koji Miyauchi", "Hello men!!!");
	    var tweet2 = new Tweet("Kenta Kasahara", "Hello!!!");

	    var tweets = new OscarsTweets();
	    tweets.add(tweet1);
	    tweets.add(tweet2);
	    tweets.remove(tweet2);
	    console.log(tweets);
		// application.main();
		// 
	});
});
