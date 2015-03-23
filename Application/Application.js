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

  //configuration for GloveView (Population)
  globeView : {
  	files: [
  		'Views/PopulationGlobeView.js',
      'Views/FlightPathGlobeView.js',
      'Views/DynamicGlobeView.js',

      'Models/GlobeModel.js',
      'Models/data/path.js',
      'Models/data/countriesList.js',
      'Libraries/text.js',
      'Libraries/font.js',
      'Libraries/map3d.js'
    ]
  }
};

require(Application.files, function(){
  Application.init();
});