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
        this.titleBox = new Application.VizTitleCenter();

        this.rootView = null;
        this.collections = [];

        Application._vent.on('controlpanel/parse', this.submitOn, this);
        Application._vent.on('visualize', this.visualizeOn, this);
        Application._vent.on('matcher/submit', this.visualizeOn, this);
        //Application._vent.on('globe/ready', this.fetchCollection, this);

        window.addEventListener('beforeunload', this.resetCollection.bind(this), false);
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);
        this.$el.append(this.notifBox.render().$el);
        this.$el.append(this.infocenter.render().$el);
        this.$el.append(this.titleBox.render().$el);

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
    // fetchCollection: function() {
    //     $.each(this.collections, function(index, collection) {

    //         collection.fetch();
    //     });
    // },
    initGlobeView: function() {

        this.resetGlobeView();

        this.rootView = new Application['RootGlobeView'](this.collections);
        this.$el.prepend(this.rootView.$el);

    },
    createCollection: function() {

        this.resetCollection();

        var collectionClasses = [];
        var that = this;
        switch (Application.userConfig.model) {

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
                    collectionClasses = ['CSVCollection'];
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
            case 'box':
                {

                    collectionClasses = ['BoxCollection'];
                    break;
                }

        }

        require(Application.models[Application.userConfig.model].url, function() {

            $.each(collectionClasses, function(index, collectionName) {

                that.collections.push(new Application[collectionName]);
                that.collections[index].fetch();

            });

        });

    },
    resetGlobeView: function() {
        if (this.rootView) {
        //    console.log("destroy rootView");
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
