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

    //Files which need to be imported for GlobeVisualization
    files: [
        'DataProcessor/DataProcessor.js',
        [
            'Helpers/Filter.js',
            'Helpers/Debug.js',
            'Helpers/DataStructures.js',
            'DataProcessor/ParserFactory.js',
            'DataProcessor/TransformerFactory.js',
            'Events/events.js',
            'Libraries/OrbitControls.js',
            'Libraries/stats.js',
            'Libraries/tween.min.js',
            'Libraries/font.js',
            'Libraries/map3d.js',
            'Libraries/papaparse.js',
            // 'Libraries/popcorn-complete.min.js',
            // 'Libraries/text.js',

            'Routes/GlobeRouter.js',
            'Routes/RootRouter.js',

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

    models: {
        spreadSheet: ['Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js'],
        googleTrends: ['Models/GoogleTrendsGlobeView/GoogleTrendsGlobeModel.js'],
        twitter: ['Models/DynamicGlobeView/DynamicGlobeModel.js'],
        csv: ['Models/FlightPathGlobeView/FlightPathGlobeModel.js','Models/data/path.js', 'Models/data/countriesList.js']
    },

    layers: {
        points: ['Views/SpreadSheetGlobeView/SpreadSheetGlobeView.js'],
        countries: ['Views/GoogleTrendsGlobeView/GoogleTrendsGlobeView.js'],
        dynamic: ['Views/DynamicGlobeView/DynamicGlobeView.js', 'Views/DynamicGlobeView/DynamicGlobeParticle.js'],
        graph: ['Views/FlightPathGlobeView/FlightPathGlobeView.js']

    }

}
require(['Helpers/Helper.js'], function(){
    Application.Helper.requireOrderly(Application.files, function(){
        Application.init();
    });
});