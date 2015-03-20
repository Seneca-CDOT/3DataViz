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

    var files, view;
    for (type in Application.globeViews) {

      if(this.type === type){
        require(files , function(){
          //Create View
          var rootGlobeView = new Application.RootGlobeView(type, view);
          $("#applicaitonRegion").empty().append(rootGlobeView.render().$el[0]);

        });
      }

    }

    // if(type===Application.globeViews.){
    //   files = Application.dynamicGlobeView.files;
    //   view = new Application.DynamicGlobeView();
    // }
    // else if(type===Application.flightPathGlobe.type){
    //   files = Application.flightPathGlobeView.files;
    //   view = new Application.FlightPathGlobeView();
    // }
    // else if(type===Application.flightPathGlobe.type){
    //   files = Application.populationGlobeView.files;
    //   view = new Application.PopulationGlobeView();
    // }


  },

});