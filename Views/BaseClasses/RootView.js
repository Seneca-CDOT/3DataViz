var Application = Application || {};

/**
 * RootView:
 * Create common views
 * @return this element
 */
Application.RootView = Backbone.View.extend({

    tagName: "div",
    id: 'rootView',
    initialize: function() {

        this.controlPanel = new Application.ControlPanelRootView();
        this.notifBox = new Application.NotificationsCenter();
        this.infocenter = new Application.VizInfoCenter();
        this.matcher = new Application.Matcher();
        this.rootView = null;
        this.collections = [];

        Application.userConfig = {
            dataSource: '',
            vizType: 'geometry',
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
        this.$el.append(this.infocenter.render().$el);
        this.$el.append(this.matcher.render().$el);
        return this;
    },
    submitOn: function() {
        $("#instruction").fadeOut('slow');
        this.createCollection();
    },
    visualizeOn: function() {
        Application._vent.trigger('vizinfocenter/message/off');
        Application._vent.trigger('controlpanel/message/off');
        Application._vent.trigger('controlpanel/message/on', 'LOADING...');
        this.initGlobeView();
        // $("#instruction").fadeOut('slow');


    },
    fetchCollection: function() {
        $.each(this.collections, function(index, collection) {

            collection.fetchAll();
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
                    collectionClasses = ['CSVCollection', ];
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

        require(Application.models[Application.userConfig.dataSource].url, function() {

            $.each(collectionClasses, function(index, collectionName) {

                that.collections.push(new Application[collectionName]);
                that.collections[index].fetch();

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
