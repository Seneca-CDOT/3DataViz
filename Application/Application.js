var Application = Application || {};

/**
 * Application object(namespace), which wraps entire application.
 * Application can has:
 * - configuration
 * - file to be loaded
 * - etc.
 * @return null
 */
Application = {

	//Create Route which handles Views and Models
  init : function(){
    this.globeRouter = new this.GlobeRouter();
    Backbone.history.start();
  },

  //Files which need to be imported for GlobeVisualization
  files : [
    'Routes/GlobeRouter.js',
    'Views/RootGlobeView.js',
    'Views/BaseGlobeView.js',
    'Models/GlobeModel.js',
    'Helpers/Helper.js',
    'Helpers/Debug.js', // FOR DEBUG
    'Libraries/OrbitControls.js',
    'Libraries/stats.js',
    'Libraries/tween.min.js',
    'Libraries/text.js',
    'Libraries/font.js',
    'Libraries/map3d.js'
  ],

  globeViews : {

    //configuration for GloveView (Population)
    population : {
      files: [
        'Views/PopulationGlobeView.js',
        'Views/ControlPanelGlobeView.js',
        'Views/ControlElementsGlobeView.js'
      ],
      views:{
        globeView : "PopulationGlobeView",
        controlPanel : "ControlPanelGlobeView"
      },
      models:{
        globeView : "PopulationGeoDataRecord"
      }
    },

    //configuration for GloveView (Flight Path)
    flightPath : {
      files: [
        'Views/FlightPathGlobeView.js',
        'Models/data/path.js',
        'Models/data/countriesList.js',
      ],
      views:{
        globeView : "FlightPathGlobeView"
      }
    },

    //configuration for GloveView (Dynamic)
    dynamic : {
      files: [
        'Views/DynamicGlobeView.js',
      ],
      views:{
        globeView : "DynamicGlobeView"
      }
    }

  }

};

require(Application.files, function(){
  Application.init();
});
