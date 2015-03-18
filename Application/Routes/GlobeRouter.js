var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.GlobeRouter = Backbone.Router.extend({

  routes : {
    "globeView" : "initGlobeView",
  },

  /**
   * Create GlobeView(CountryBaseGlobe) and append it to the page.
   * @return null
   */
  initGlobeView: function(){
    require(Application.globeView.files , function(){

      //Create View
      var rootGlobeView = new Application.RootGlobeView();
      $("#applicaitonRegion").empty().append(rootGlobeView.render().$el[0]);

    });
  },

});