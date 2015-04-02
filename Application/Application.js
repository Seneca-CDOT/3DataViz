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
    this.router = new this.GlobeRouter();
    Backbone.history.start();
  },

  //Files which need to be imported for GlobeVisualization
  files : [
    'Routes/GlobeRouter.js',
    'Views/RootGlobeView.js',
    'Views/BaseGlobeView.js',
    'Models/GlobeModel.js',
    'Helpers/Helper.js',
    'Helpers/Debug.js',
    'Helpers/DataStructures.js',
    'Libraries/OrbitControls.js',
    'Libraries/stats.js',
    'Libraries/tween.min.js',
    'Libraries/text.js',
    'Libraries/font.js',
    'Libraries/map3d.js'
  ],

  globeViews : {
    //configuration for GloveView (Population)
    statictwitter : {
      files: [
        'Views/StaticTwitterGlobeView.js',
        'Views/ControlPanelGlobeView.js',
        'Views/ControlElementsGlobeView.js'
      ],
      views:{
        globeView : "StaticTwitterGlobeView",
        controlPanel : "StaticTwitterControlPanel"
      },
      collection:{
        globeView : "StaticTwitterCountriesCollection"
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
        'Views/DynamicGlobeView/DynamicGlobeView.js',
        'Views/DynamicGlobeView/DynamicGlobeParticle.js',
      ],
      views:{
        globeView : "DynamicGlobeView",
      }
    }

  }

};

require(Application.files, function(){
  Application.init();
});
