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
        this.rootGlobeView = null;

        Application._vent.on('controlpanel', this.submitOn.bind(this));
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    submitOn: function(config) {

        // console.log(config);
        this.initGlobeView(config);
    },

    initGlobeView: function(config) {

        if (this.rootGlobeView) {

            this.rootGlobeView.destroy();
            this.rootGlobeView = null;
        }

      // {dataSourcesList: "", 
      // visualizationList: "", 
      // templatesList: "", 
      // userInput: ""}

        var files = null;
        var rootGlobeViewClass = null;
        switch(config.templatesList) {

            case "static":
            {  
                files = Application.globeViews.googleTrends.files;
                rootGlobeViewClass = 'GoogleTrendsRootGlobeView';
                // rootGlobeViewClass = 'SpreadSheetRootGlobeView';
                break;
            }
            case "dynamic":
            {
                files = Application.globeViews.dynamic.files;
                rootGlobeViewClass = 'DynamicRootGlobeView';
                break;
            }
            case "graph":
            {
                files = Application.globeViews.flightPath.files;
                rootGlobeViewClass = 'FlightPathRootGlobeView';
                break;
            }
        }

        if (files && rootGlobeViewClass) {

            var that = this;
            require(files, function() {

                that.rootGlobeView = new Application[rootGlobeViewClass](config);
                that.$el.prepend(that.rootGlobeView.render().$el);
            });
        }
    }
});