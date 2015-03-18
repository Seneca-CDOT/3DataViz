var App = App || {};

/**
 * App.Router (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
App.GlobeRouter = Backbone.Router.extend({

  routes : {
    "globeView" : "initGlobeView",
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

});