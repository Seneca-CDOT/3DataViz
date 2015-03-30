var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.GlobeRouter = Backbone.Router.extend({

  routes : {
    "globeView/population" : "initPopulationGlobeView",
    "globeView/flightPath" : "initFlightPathGlobeView",
    "globeView/dynamic" : "initDynamicGlobeView",
    //"globeView/population/:action" : "doSomething",
    //"globeView/flightPath/:action" : "doSomething",
    //"globeView/dynamic/:action" : "doSomething",
  },

  initGlobeView: function(views, models){

    /**
     * TODO:
     * If this.rootGlobeView is not null and not same with previous globe,
     * then clean up the view.
     */
    this.rootGlobeView = new Application.RootGlobeView(views, models);
    $("#applicaitonRegion").empty().append(this.rootGlobeView.render().$el[0]);

  },

  initPopulationGlobeView: function(){
    require(Application.globeViews.population.files , function(){

      var views = Application.globeViews.population.views;
      var models = Application.globeViews.population.models;
      Application.globeRouter.initGlobeView(views, models);

    });
  },

  initFlightPathGlobeView: function(){
    require(Application.globeViews.flightPath.files , function(){

      var views = Application.globeViews.flightPath.views;
      var models = Application.globeViews.flightPath.models;
      Application.globeRouter.initGlobeView(views, models);

    });
  },

  initDynamicGlobeView: function(){

    require(Application.globeViews.dynamic.files , function(){

      var views = Application.globeViews.dynamic.views;
      var models = Application.globeViews.dynamic.models;
      Application.globeRouter.initGlobeView(views, models);

    });
  }


});