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
        [
            'DataProcessor/DataProcessor.js',
            'Views/GlobeDecorators/BaseGlobeDecorator.js',
        ],
        [
            'Helpers/Debug.js',
            'Helpers/Filter.js',
            'Helpers/DataStructures.js',
            'DataProcessor/ParserFactory.js',
            'DataProcessor/TransformerFactory.js',
            'Events/events.js',
            'Libraries/OrbitControls.js',
            'Libraries/stats.js',
            'Libraries/tween.min.js',
            'Libraries/map3d.js',
            'Libraries/papaparse.js',

            'Routes/RootRouter.js',
            'Views/GlobeDecorators/GeometryGlobeDecorator.js',
            'Views/GlobeDecorators/TextureGlobeDecorator.js',
            'Views/GlobeDecorators/GlobeDecoratorFactory.js',

            'Views/ControlPanel/ControlPanelGlobeView.js',
            'Views/ControlPanel/ControlElementsGlobeView.js',
            'Views/ControlPanel/Matcher.js',
            'Views/ControlPanel/FiltersView.js',

            'Views/BaseClasses/RootView.js',
            'Views/BaseClasses/RootGlobeView.js',
            'Views/BaseClasses/BaseGlobeView.js',

            'Models/BaseClasses/BaseGlobeModel.js',

        ]
    ],

    models: {
        name: 'dataSource',
        list: ['twitterDB', 'twitterLive', 'csv', 'box', 'spreadSheet', 'googleTrends'],
        spreadSheet: {
            url: ['Models/SpreadSheetGlobeModel.js'],
            attributes: true
        },
        googleTrends: {
            url: ['Models/GoogleTrendsGlobeModel.js'],
            attributes: false
        },
        twitterDB: {
            url: ['Models/TwitterDBModel.js'],
            attributes: false
        },
        twitterLive: {
            url: ['Models/TwitterLiveModel.js'],
            attributes: false
        },
        // csv: ['Models/FlightPathGlobeModel.js','Models/data/path.js', 'Models/data/countriesList.js']
        csv: {
            url: ['Models/CSVGlobeModel.js'],
            attributes: true
        },
        box: {
            url: ['Models/BoxGlobeModel.js'],
            attributes: true
        }
    },

    templates: {
        name: 'vizLayer',
        list: ['countries', 'points', 'dynamic', 'graph'],
        countries: {
            url: ['Views/Layers/CountriesLayer.js'],
            attributes: {
                default: ['countryname', 'value', 'category'],
                optional: ['category', 'countrycode', 'label']
            },
            filters: ['country'],
        },
        points: {
            url: ['Views/Layers/PointsLayer.js'],
            attributes: {
                default: ['latitude', 'longitude', 'label', 'category'],
                optional: ['label', 'value', 'category']
            },
            filters: [],
        },
        dynamic: {
            url: ['Views/Layers/DynamicLayer.js', 'Views/Layers/DynamicLayerParticle.js'],
            attributes: {
                default: ['latitude', 'longitude', 'timestamp'],
                optional: ['value', 'category']
            },
            filters: [],
        },
        graph: {
            url: ['Views/Layers/GraphsLayer.js'],
            attributes: {
                default: ['latitudeFrom', 'longitudeFrom', 'latitudeTo', 'longitudeTo'],
                optional: ['timestamp', 'value', 'fromLabel', 'toLabel', 'category']
            },
            filters: [],
        },
    }

}
require(['Helpers/Helper.js'], function() {
    Application.Helper.requireOrderly(Application.files, function() {
        Application.init();
    });
});
