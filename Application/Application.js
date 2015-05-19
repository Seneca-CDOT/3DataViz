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

        this.rootRouter = new this.RootRouter();
        this.globeRouter = new this.GlobeRouter();
        Backbone.history.start();
    },

    //Files which need to be imported for GlobeVisualization
    files: [
        'Routes/GlobeRouter.js',
        'Routes/RootRouter.js',
        'Views/BaseClasses/RootView.js',
        'Views/BaseClasses/RootGlobeView.js',
        'Views/BaseClasses/BaseGlobeView.js',
        'Models/BaseClasses/BaseGlobeModel.js',
        'Views/ControlPanelGlobeView.js',
        'Views/ControlElementsGlobeView.js', 

        'Helpers/Filter.js',
        'Helpers/Helper.js',
        'Helpers/Debug.js',
        'Helpers/DataStructures.js',

        'DataProcessor/DataProcessor.js',
        'DataProcessor/ParserFactory.js',
        'DataProcessor/TransformerFactory.js',

        'Libraries/OrbitControls.js',
        'Libraries/stats.js',
        'Libraries/tween.min.js',
        'Libraries/text.js',
        'Libraries/font.js',
        'Libraries/map3d.js',
        // 'Libraries/popcorn-complete.min.js',
        'Libraries/papaparse.js'
    ],

    globeViews: {

        //configuration for FlightPathGlobeView
        flightPath: {
            files: [
                'Views/FlightPathGlobeView/FlightPathRootGlobeView.js',
                'Views/BaseClasses/BaseTextureGlobeView.js', 
                'Views/FlightPathGlobeView/FlightPathGlobeView.js',
                'Models/FlightPathGlobeView/FlightPathGlobeModel.js',
                'Models/data/path.js',
                'Models/data/countriesList.js'
                // 'Views/VideoView.js',
                // 'Views/SliderControlView.js',
            ],
        },

        //configuration for DynamicGlobeView
        dynamic: {
            files: [
                'Views/DynamicGlobeView/DynamicRootGlobeView.js',
                'Views/BaseClasses/BaseGeometryGlobeView.js', 
                'Views/DynamicGlobeView/DynamicGlobeView.js',
                'Views/DynamicGlobeView/DynamicGlobeParticle.js',
                'Models/DynamicGlobeView/DynamicGlobeModel.js'
            ]
        },

        //configuration for SpreadSheetGlobeView
        spreadSheet: {
            files: [
                'Views/SpreadSheetGlobeView/SpreadSheetRootGlobeView.js',
                'Views/BaseClasses/BaseGeometryGlobeView.js', 
                'Views/SpreadSheetGlobeView/SpreadSheetGlobeView.js',
                'Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js' // TODO: separate static twitter, spread sheet and other models
                'Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js'
            ]
        },

        //configuration for GoogleTrendsGlobeView
        googleTrends: {
            files: [
                'Views/GoogleTrendsGlobeView/GoogleTrendsRootGlobeView.js',
                'Views/BaseClasses/BaseGeometryGlobeView.js', 
                'Views/GoogleTrendsGlobeView/GoogleTrendsGlobeView.js',
                'Models/GoogleTrendsGlobeView/GoogleTrendsGlobeModel.js'
            ]
        }
    }
};

require(Application.files, function() {
    Application.init();
});
