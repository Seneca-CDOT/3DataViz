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
        this.notifBox = new Application.NotificationsCenter();
        this.rootView = null;
        this.collections = [];

        Application.userConfig = {
            dataSource: '',
            vizType: '',
            vizLayer: '',
            input: '',
            interval: '',
            timeFrom: '',
            timeTo: ''

        };
        Application._vent.on('controlpanel/parse', this.submitOn, this);
        Application._vent.on('visualize', this.visualizeOn, this);
        Application._vent.on('globe/ready', this.fetchCollection, this);

        window.addEventListener('beforeunload', this.resetCollection.bind(this), false);
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);
        this.$el.append(this.notifBox.render().$el);
        return this;
    },
    submitOn: function() {
        //console.log('data/ready');
        this.createCollection();
    },
    visualizeOn: function() {
        Application._vent.trigger('controlpanel/message/off');
        Application._vent.trigger('controlpanel/message/on','LOADING...');
        this.initGlobeView();
        
        $("#instruction").fadeOut('slow');
        

    },
    fetchCollection: function() {
        $.each(this.collections, function(index, collection) {

            collection.fetch();
        });
    },
    initGlobeView: function() {

        this.resetGlobeView();

        this.rootView = new Application['RootGlobeView'](this.collections);
        this.$el.prepend(this.rootView.$el);

    },
    createCollection: function() {

        this.resetCollection();

        var collectionClasses = [];
        var that = this;
        switch (Application.userConfig.dataSource) {

            case 'twitterLive':
                {

                    collectionClasses = ['TweetsLive'];
                    break;

                }
            case 'twitterDB':
                {

                    collectionClasses = ['TweetsDB'];
                    break;

                }
            case 'csv':
                {

                    // collectionClasses = ['AirportsCollection', 'AirportRoutesCollection'];
                    collectionClasses = ['CSVCollection',];
                    break;
                }
            case 'spreadSheet':
                {

                    collectionClasses = ['SpreadSheetCollection'];
                    break;

                }
            case 'googleTrends':
                {

                    collectionClasses = ['GoogleTrendsCollection'];
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
    resetGlobeView: function() {
        if (this.rootView) {
            console.log("destroy rootView");
            this.rootView.destroy();
            this.rootView = null;
        }
    },
    resetCollection: function() {
        if (this.collections.length > 0) {
            $.each(this.collections, function(index, collectionName) {
                collectionName.destroy();
            });
            this.collections = [];
        }
    },

});
