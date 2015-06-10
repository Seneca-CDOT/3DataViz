var Application = Application || {};

/**
 * RootView:
 * Create common views
 * @return this element
 */
Application.RootView = Backbone.View.extend({

    tagName: "div",
    initialize: function() {

        this.controlPanel = new Application.ControlPanelRootView();
        this.rootView = null;
        this.collections = [];

        Application.userConfig = {
            dataSource: '',
            vizType: '',
            vizLayer: '',
            input: ''

        };

        Application._vent.on('visualize', this.submitOn.bind(this));
        Application._vent.on('controlpanel/parse', this.createCollection.bind(this));
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    submitOn: function() {

        console.log('data/ready');
        this.initGlobeView();
        
    },

    initGlobeView: function() {

        if (this.rootView) {

            this.rootView.destroy();
            this.rootView = null;
        }

        // {dataSourcesList: "",
        // visualizationList: "",
        // templatesList: "",
        // userInput: ""}

        // var rootViewClass = null;
        // switch (config.templatesList) {

        //     case "countries":
        //     case "points":
        //     case "dynamic":
        //     case "graph":
        //         {
        //             rootViewClass = 'RootGlobeView';
        //             break;
        //         }

        // }

        this.rootView = new Application['RootGlobeView'](this.collections);

        //this.rootView.collection = this.collections;
        this.$el.prepend(this.rootView.$el);

    },
    createCollection: function() {

        this.collections.length = 0;

        console.log("createCollection");
       // console.log(config);
        var collectionClasses = [];
        var that = this;
        switch (Application.userConfig.dataSource) {

            case 'twitter':
                {

                    collectionClasses = ['Tweets'];
                    //files = ['Models/DynamicGlobeView/DynamicGlobeModel.js'];
                    break;

                }
            case 'csv':
                {

                    collectionClasses = ['AirportsCollection', 'AirportRoutesCollection'];
                    //files = ['Models/FlightPathGlobeView/FlightPathGlobeModel.js'];
                    break;
                }
            case 'spreadSheet':
                {

                    collectionClasses = ['SpreadSheetCollection'];
                    // files = ['Models/SpreadSheetGlobeView/SpreadSheetGlobeModel.js'];
                    break;

                }
            case 'googleTrends':
                {

                    collectionClasses = ['GoogleTrendsCollection'];
                    //  files = ['Models/GoogleTrendsGlobeView/GoogleTrendsGlobeModel.js'];
                    break;
                }

        }

        require(Application.models[Application.userConfig.dataSource], function() {

            $.each(collectionClasses, function(index, collectionName) {

                that.collections.push(new Application[collectionName]);
                that.collections[index].fetch();

            });

        });

    },
});