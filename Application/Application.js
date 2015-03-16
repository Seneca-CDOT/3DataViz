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
    this.router = new this.Router();
    Backbone.history.start();
  },

  //Files which need to be imported for GlobeVisualization
  files : [
    'Routes/Routes',
    'Libraries/OrbitControls.js',
    'Libraries/stats.js',
    'Libraries/tween.min.js'
  ],
  //configuration for GloveView (Population)
  globeView : {
  	//regions: [ 'App.GloveView' ],
  	files: [
  		'Views/GlobeView.js',
      'Views/RootGlobeView.js',
      'Models/GlobeModel.js',
      'Libraries/text.js',
      'Libraries/font.js',
      'Libraries/map3d.js'
    ]
  },
  //configuration for GloveView2 (FlightPath)
  globeView2 : {
  	//regions: [ 'App.GloveView2' ],
  	files: [
  		'Models/data/countriesList.js',
  		'Models/data/path.js',
  		'Views/GlobeView2.js',
      'Views/RootGlobeView2.js',
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