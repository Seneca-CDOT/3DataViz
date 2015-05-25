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
        Backbone.history.start();
    },

    //Load files recursively.
    loadFiles : function(files, index){
        if(typeof files[index] == 'undefined'){
            Application.init();
        }else{
            require(files[index], function() {
                Application.loadFiles(Application.files, index+1);
            });
        }
    },

    //Files which need to be imported for GlobeVisualization
    files: [
        [
            'Helpers/Filter.js',
            'Helpers/Helper.js',
            'Helpers/Debug.js',
            'Helpers/DataStructures.js',
            'DataProcessor/DataProcessor.js',
            'DataProcessor/ParserFactory.js',
            'DataProcessor/TransformerFactory.js'
        ],
        [
            'Events/events.js',
            'Libraries/OrbitControls.js',
            'Libraries/stats.js',
            'Libraries/tween.min.js',
            'Libraries/text.js',
            'Libraries/font.js',
            'Libraries/map3d.js',
            // 'Libraries/popcorn-complete.min.js',
            'Libraries/papaparse.js',

            'Routes/RootRouter.js',
            'Routes/GlobeRouter.js',

            'Views/GlobeDecorators/BaseGlobeDecorator.js',
            'Views/GlobeDecorators/GeometryGlobeDecorator.js',
            'Views/GlobeDecorators/TextureGlobeDecorator.js',
            'Views/GlobeDecorators/GlobeDecoratorFactory.js',


            'Views/ControlPanelGlobeView.js',
            'Views/ControlElementsGlobeView.js',

            'Views/BaseClasses/RootView.js',
            'Views/BaseClasses/RootGlobeView.js',
            'Views/BaseClasses/BaseGlobeView.js',
            'Models/BaseClasses/BaseGlobeModel.js',

        ]
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
                'Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js' // TODO: separate static twitter, spread sheet and other models
            ]
        },

        //configuration for GoogleTrendsGlobeView
        googleTrends: {
            files: [
                'Views/GoogleTrendsGlobeView/GoogleTrendsRootGlobeView.js',
                'Views/GoogleTrendsGlobeView/GoogleTrendsGlobeView.js',
                'Models/GoogleTrendsGlobeView/GoogleTrendsGlobeModel.js'
            ]
        }
    }
};
Application.loadFiles(Application.files, 0);