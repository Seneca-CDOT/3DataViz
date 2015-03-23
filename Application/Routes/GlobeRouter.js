var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.GlobeRouter = Backbone.Router.extend({

  routes : {
    "globeView/:type" : "initGlobeView"
  },

  /**
   * Create GlobeView(CountryBaseGlobe) and append it to the page.
   * @return null
   */
  initGlobeView: function(type){

    if(Application.globeViews[type]){
      require(Application.globeViews[type].files , function(){

        var rootGlobeView = new Application.RootGlobeView(Application.globeViews[type].views);
        $("#applicaitonRegion").empty().append(rootGlobeView.render().$el[0]);

      });
    }

  },

});