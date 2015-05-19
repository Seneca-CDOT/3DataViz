var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.GlobeRouter = Backbone.Router.extend({

    routes: {
        "globeView/spreadSheet": "initSpreadSheetGlobeView",
        "globeView/staticTwitter": "initStaticTwitterGlobeView",
        "globeView/flightPath": "initFlightPathGlobeView",
        "globeView/dynamic": "initDynamicGlobeView",
        "globeView/googleTrends": "initGoogleTrendsGlobeView"
    },
    initGoogleTrendsGlobeView: function() {
        var that = this;
        require(Application.globeViews.googleTrends.files, function() {

            that.rootGlobeView = new Application.GoogleTrendsRootGlobeView();
            $("#applicationRegion").prepend(that.rootGlobeView.$el);
            that.rootGlobeView.render();

            //call fetch test
            // that.rootGlobeView.globeView.collection.fetch({
            //   success: function(){
            //     // console.log(Application.router.rootGlobeView.globeView.collection);
            //   }
            // });

        });
    },
    initSpreadSheetGlobeView: function() {

        var that = this;
        require(Application.globeViews.spreadSheet.files, function() {

            that.rootGlobeView = new Application.SpreadSheetRootGlobeView();
            $("#applicationRegion").prepend(that.rootGlobeView.$el);
            that.rootGlobeView.render();

            //call fetch test
            // that.rootGlobeView.globeView.collection.fetch({
            //   success: function(){
            //     // console.log(Application.router.rootGlobeView.globeView.collection);
            //   }
            // });

        });
    },
    initStaticTwitterGlobeView: function() {

        var that = this;
        require(Application.globeViews.staticTwitter.files, function() {

            that.rootGlobeView = new Application.StaticTwitterRootGlobeView();
            $("#applicationRegion").prepend(that.rootGlobeView.$el);
            that.rootGlobeView.render();

            //call fetch test
            that.rootGlobeView.globeView.collection.fetch({
                success: function() {
                    // console.log(Application.router.rootGlobeView.globeView.collection);
                }
            });

        });
    },
    initFlightPathGlobeView: function() {
        var that = this;
        require(Application.globeViews.flightPath.files, function() {
            that.rootGlobeView = new Application.FlightPathRootGlobeView();
            $("#applicationRegion").prepend(that.rootGlobeView.$el);
            that.rootGlobeView.render();
        });
    },
    initDynamicGlobeView: function() {

        var that = this;
        require(Application.globeViews.dynamic.files, function() {

            that.rootGlobeView = new Application.DynamicRootGlobeView();
            $("#applicationRegion").prepend(that.rootGlobeView.$el);
            that.rootGlobeView.render();

            //call fetch test
            that.rootGlobeView.globeView.collection.fetch({
                success: function() {
                    // console.log(Application.router.rootGlobeView.globeView.collection);
                }
            });

        });
    }

});