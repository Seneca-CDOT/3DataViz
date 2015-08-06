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
            'Views/BaseClasses/BaseView.js',
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
            'Views/BaseClasses/BasePointCloudView.js',

            'Models/BaseClasses/BaseGlobeModel.js',

        ]
    ],

    models: {
        name: 'model',
        map: { /*twitterDB: 'Tweets from DB', twitterLive: 'Twitter Live',*/ csv: 'Local File', box: 'BOX', spreadSheet:'Google SpreadSheet', googleTrends: 'Google Trends' },
        spreadSheet: {
            url: ['Models/SpreadSheetGlobeModel.js'],
            attributes: true,
            templates: ['points', 'countries', 'graph']
        },
        googleTrends: {
            url: ['Models/GoogleTrendsGlobeModel.js'],
            attributes: false,
            templates: ['countries']
        },
        twitterDB: {
            url: ['Models/TwitterDBModel.js'],
            attributes: false,
            templates: ['dynamic']
        },
        twitterLive: {
            url: ['Models/TwitterLiveModel.js'],
            attributes: false,
            templates: ['dynamic']
        },
        csv: {
            url: ['Models/CSVGlobeModel.js'],
            attributes: true,
            templates: ['points', 'countries', 'graph']
        },
        box: {
            url: ['Models/BoxGlobeModel.js'],
            attributes: true,
            templates: ['points', 'countries', 'graph']
        }
    },

    templates: {
        name: 'template',
        map: { countries: 'regional', points: 'location', /*dynamic: 'realtime',*/ graph: 'relationship', pointcloud: 'pointcloud' },  // internal name / display name
        countries: {
            url: ['Views/Layers/CountriesLayer.js'],
            attributes: {
                default: ['country', 'value', 'category'],
                optional: ['category', 'countrycode', 'label']
            },
            filters: ['country'],
            decorator: 'geometry',
        },
        points: {
            url: ['Views/Layers/PointsLayer.js'],
            attributes: {
                default: ['latitude', 'longitude', 'label', 'value', 'category'],
                optional: ['label', 'value', 'category']
            },
            filters: [],
            decorator: 'geometry',
        },
        dynamic: {
            url: ['Views/Layers/DynamicLayer.js', 'Views/Layers/DynamicLayerParticle.js'],
            attributes: {
                default: ['latitude', 'longitude', 'timestamp'],
                optional: ['value', 'category']
            },
            filters: [],
            decorator: 'geometry',
        },
        graph: {
            url: ['Views/Layers/GraphsLayer.js'],
            attributes: {
                default: ['latitudeFrom', 'longitudeFrom', 'latitudeTo', 'longitudeTo', 'fromLabel', 'toLabel', 'value', 'category'],
                optional: ['timestamp', 'value', 'fromLabel', 'toLabel', 'category']
            },
            filters: [],
            decorator: 'geometry',
        },
        pointcloud: {
          	url: ['Views/Layers/PointCloudLayer.js'],
              attributes: {
          	    default: ['x','y','z','value','category'],
                optional: ['value','category']
              },
          	filters: [],
            decorator: ''
        }
    },
    userConfig: {
        model: '',
        decorator: '',
        files: '',
        template: '',
        input: '',
        interval: '',
        timeFrom: '',
        timeTo: '',
        fileInfo: {}
    }

}
require(['Helpers/Helper.js'], function() {
    Application.Helper.requireOrderly(Application.files, function() {
        Application.init();
    });
});
