var App = App || {};

/**
 * Application object(namespace), which wraps entire application.
 * Application can has:
 * - configuration
 * - file to be loaded
 * - etc.
 * @return null
 */
App = {

	//Create Route which handles Views and Models
  init : function(){
    this.router = new this.GlobeRouter();
    Backbone.history.start();
  },

  //Files which need to be imported for GlobeVisualization
  files : [
    'Views/RootGlobeView.js',
    'Views/BaseGlobeView.js',

    'Routes/Routes',
    'Helpers/ApplicationHelper',
    'Helpers/Debug', // FOR DEBUG
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
      'Libraries/text.js',
      'Libraries/font.js',
      'Libraries/map3d.js'
    ]
  }
};

require(App.files, function(){
  App.init();
});