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

    //Files which need to be imported for GlobeVisualization
    files: [
        'Routes/GlobeRouter.js',
        'Views/GlobeDecorators/GeometryGlobeDecorator.js', 
        'Views/GlobeDecorators/TextureGlobeDecorator.js', 
        'Views/BaseClasses/RootGlobeView.js',
        'Views/BaseClasses/BaseGlobeView.js',
        'Models/BaseClasses/BaseGlobeModel.js', 

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
                'Views/DynamicGlobeView/DynamicGlobeView.js',
                'Views/DynamicGlobeView/DynamicGlobeParticle.js',
                'Models/DynamicGlobeView/DynamicGlobeModel.js'
            ]
        },

        //configuration for SpreadSheetGlobeView
        spreadSheet: {
            files: [
                'Views/SpreadSheetGlobeView/SpreadSheetRootGlobeView.js',            
                'Views/SpreadSheetGlobeView/SpreadSheetGlobeView.js',
                'Views/ControlPanelGlobeView.js',
                'Views/ControlElementsGlobeView.js',
                'Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js'
            ]
        },

        //configuration for GoogleTrendsGlobeView
        googleTrends: {
            files: [
                'Views/GoogleTrendsGlobeView/GoogleTrendsRootGlobeView.js',
                'Views/GoogleTrendsGlobeView/GoogleTrendsGlobeView.js',
                'Views/ControlPanelGlobeView.js',
                'Views/ControlElementsGlobeView.js',
                'Models/GoogleTrendsGlobeView/GoogleTrendsGlobeModel.js'
            ]
        }
    }
};

require(Application.files, function() {
    Application.init();
});
