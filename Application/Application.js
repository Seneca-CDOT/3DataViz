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
    init: function() {
        this.router = new this.GlobeRouter();
        Backbone.history.start();
    },

// <<<<<<< HEAD
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
    'Libraries/map3d.js',
    'Libraries/papaparse.js'
  ],
// =======
    //Files which need to be imported for GlobeVisualization
    files: [
        'Routes/GlobeRouter.js',
        'Views/BaseClasses/RootGlobeView.js',
        'Views/BaseClasses/BaseGlobeView.js',

        'Helpers/Helper.js',
        'Helpers/Debug.js',
        'Helpers/DataStructures.js',
        'Helpers/Filter.js',

        'Models/GlobeModel.js',

        'Libraries/OrbitControls.js',
        'Libraries/stats.js',
        'Libraries/tween.min.js',
        'Libraries/text.js',
        'Libraries/font.js',
        'Libraries/map3d.js',
        'Libraries/popcorn-complete.min.js'
    ],
// >>>>>>> 5d3acc41c95638beeb7acdf6531d3da412f9415e

    globeViews: {
        //configuration for GloveView (Population)
        statictwitter: {
            files: [
                'Views/StaticTwitterGlobeView/StaticTwitterRootGlobeView.js',
                'Views/StaticTwitterGlobeView/StaticTwitterGlobeView.js',
                'Views/ControlPanelGlobeView.js',
                'Views/ControlElementsGlobeView.js',
            ]
        },

        //configuration for GloveView (Flight Path)
        flightPath: {
            files: [
                'Views/FlightPathGlobeView.js',
                'Models/data/path.js',
                'Models/data/countriesList.js',
// <<<<<<< HEAD
                // 'Views/VideoView.js',
                // 'Views/SliderControlView.js',
            ],
            views: {
                globeView: "FlightPathGlobeView",
                // sliderlView : "SliderControlView",
                // videoView   : "VideoView",
            },

            collection: {
                globeView: "AirportRoutesCollection"
            }
// =======
            ]
// >>>>>>> 7f8f7e9c0e990eaebe6a5799b3d5f560f51edc15
        },

        //configuration for GloveView (Dynamic)
        dynamic: {
            files: [
                'Views/DynamicGlobeView/DynamicRootGlobeView.js',
                'Views/DynamicGlobeView/DynamicGlobeView.js',
                'Views/DynamicGlobeView/DynamicGlobeParticle.js',
            ]
        },

        //configuration for SpreadSheetGlobeView
        spreadsheet: {
            files: [
                'Views/SpreadSheetGlobeView.js',
                'Views/ControlPanelGlobeView.js',
                'Views/ControlElementsGlobeView.js'
            ]
        }
    }
};

require(Application.files, function() {
    Application.init();
});
