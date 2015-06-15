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
            input: '',
            timeFrom: '',
            timeTo: ''

        };
        Application._vent.on('controlpanel/parse', this.submitOn.bind(this));
        Application._vent.on('visualize', this.visualizeOn.bind(this));
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    submitOn: function() {
        console.log('data/ready');
        this.createCollection();
    },
    visualizeOn: function(){
        console.log('visualize');
        $.each(this.collections, function(index, collection) {

            collection.fetch();
        });
        this.initGlobeView();
    },
    initGlobeView: function() {

        if (this.rootView) {
            console.log("destroy rootView");
            this.rootView.destroy();
            this.rootView = null;
        }

        this.rootView = new Application['RootGlobeView'](this.collections);
        this.$el.prepend(this.rootView.$el);

    },
    createCollection: function() {

        if(this.collections.length > 0){
            $.each(this.collections, function(index, collectionName){
                collectionName.destroy();
            });
            this.collections = [];
        }

        var collectionClasses = [];
        var that = this;
        switch (Application.userConfig.dataSource) {

            case 'twitterLive':
                {

                    collectionClasses = ['TweetsLive'];
                    //files = ['Models/DynamicGlobeView/DynamicGlobeModel.js'];
                    break;

                }
            case 'twitterDB':
                {

                    collectionClasses = ['TweetsDB'];
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
                that.collections[index].preParse();

            });

        });

    },
});