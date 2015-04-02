var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.GlobeRouter = Backbone.Router.extend({

  routes : {
    "globeView/statictwitter" : "initStaticTwitterGlobeView",
    "globeView/flightPath" : "initFlightPathGlobeView",
    "globeView/dynamic" : "initDynamicGlobeView",
    //"globeView/population/:action" : "doSomething",
    //"globeView/flightPath/:action" : "doSomething",
    //"globeView/dynamic/:action" : "doSomething",
  },

  initGlobeView: function(views, collection){

    /**
     * TODO:
     * If this.rootGlobeView is not null and not same with previous globe,
     * then clean up the view.
     */
    this.rootGlobeView = new Application.RootGlobeView(views, collection);
    $("#applicaitonRegion").empty().append(this.rootGlobeView.render().$el[0]);

  },

  initStaticTwitterGlobeView: function(){
    require(Application.globeViews.statictwitter.files , function(){

      var views = Application.globeViews.statictwitter.views;
      var collection = Application.globeViews.statictwitter.collection;
      Application.router.initGlobeView(views, collection);

      //call fetch test
      Application.router.rootGlobeView.globeView.collection.fetch({
        success: function(){
          // console.log(Application.router.rootGlobeView.globeView.collection);
        }
      });

    });
  },

  initFlightPathGlobeView: function(){
    require(Application.globeViews.flightPath.files , function(){

      var views = Application.globeViews.flightPath.views;
      var collection = Application.globeViews.flightPath.collection;
      Application.router.initGlobeView(views, collection);

    });
  },

  initDynamicGlobeView: function(){

    require(Application.globeViews.dynamic.files , function(){

      var views = Application.globeViews.dynamic.views;
      var collection = Application.globeViews.dynamic.collection;
      Application.router.initGlobeView(views, collection);

      //call fetch test
      Application.router.rootGlobeView.globeView.collection.fetch({
        success: function(){
          // console.log(Application.router.rootGlobeView.globeView.collection);
        }
      });

    });
  }

});