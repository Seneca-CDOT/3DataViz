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
        this.notifBox = $('<div id="notificationsBox"></div>');
        // this.notifBox.hide();
        this.$el.append(this.notifBox);
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
        Application._vent.on('controlpanel/parse', this.submitOn.bind(this));
        Application._vent.on('visualize', this.visualizeOn.bind(this));
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    submitOn: function() {
        //console.log('data/ready');
        this.createCollection();
    },
    visualizeOn: function() {
        this.notifBox.hide();
        $.each(this.collections, function(index, collection) {

            collection.fetch();
        });
        this.initGlobeView();
    },
    initGlobeView: function() {

        if (this.rootView) {
            //console.log("destroy rootView");
            this.rootView.destroy();
            this.rootView = null;
        }

        this.rootView = new Application['RootGlobeView'](this.collections);
        this.$el.prepend(this.rootView.$el);

    },
    createCollection: function() {

        if (this.collections.length > 0) {
            $.each(this.collections, function(index, collectionName) {
                collectionName.destroy();
                collectionName = null;
            });
            this.collections = [];
        }

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

                    collectionClasses = ['AirportsCollection', 'AirportRoutesCollection'];
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
});
