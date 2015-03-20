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
    'Views/RootGlobeView.js',
    'Views/BaseGlobeView.js',

    'Routes/GlobeRouter.js',
    'Helpers/Helper.js',
    'Helpers/Debug.js', // FOR DEBUG
    'Libraries/OrbitControls.js',
    'Libraries/stats.js',
    'Libraries/tween.min.js'
  ],

  globeViews : {
    //configuration for GloveView (Population)
    //TODO: put files which needed for the paticular view
    population : {
      files: [
        'Views/PopulationGlobeView.js',

        'Models/GlobeModel.js',
        'Libraries/text.js',
        'Libraries/font.js',
        'Libraries/map3d.js'
      ]
    },

    //configuration for GloveView (Flight Path)
    //TODO: put files which needed for the paticular view
    flightPath : {
      files: [
        'Views/FlightPathGlobeView.js',

        'Models/GlobeModel.js',
        'Libraries/text.js',
        'Libraries/font.js',
        'Libraries/map3d.js'
      ]
    },

    //configuration for GloveView (Dynamic)
    //TODO: put files which needed for the paticular view
    dynamic : {
      files: [
        'Views/DynamicGlobeView.js',

        'Models/GlobeModel.js',
        'Libraries/text.js',
        'Libraries/font.js',
        'Libraries/map3d.js'
      ]
    }

  }

};

require(Application.files, function(){
  Application.init();
});