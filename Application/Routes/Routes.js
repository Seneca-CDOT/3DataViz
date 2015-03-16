var App = App || {};

/**
 * App.Router (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
App.Router = Backbone.Router.extend({

  routes : {
    "globeView" : "initGlobeView",
    "globeView2" : "initGlobeView2"
  },

  /**
   * Create GlobeView(CountryBaseGlobe) and append it to the page.
   * @return null
   */
  initGlobeView: function(){
    require(App.globeView.files , function(){

      //Create View
      var rootGlobeView = new App.RootGlobeView();
      $("#applicaitonRegion").empty().append(rootGlobeView.render().$el[0]);

    });
  },

  /**
   * Create GlobeView2(flightPathGlobe) and append it to the page.
   * @return {[type]} [description]
   */
  initGlobeView2: function(){
    require(App.globeView2.files , function(){

      //Create View
      var rootGlobeView = new App.RootGlobeView2();
      $("#applicaitonRegion").empty().append(rootGlobeView.render().$el[0]);

    });
  }

});