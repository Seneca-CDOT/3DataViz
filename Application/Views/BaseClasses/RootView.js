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

        if (this.rootView) {

            this.rootView.destroy();
            this.rootView = null;
        }

      // {dataSourcesList: "", 
      // visualizationList: "", 
      // templatesList: "", 
      // userInput: ""}

        //var files = null;
        var rootViewClass = null;
        switch(config.templatesList) {

            // case "countries":
            // {  
            //     files = Application.globeViews.googleTrends.files;
            //     rootGlobeViewClass = 'GoogleTrendsGlobeView';
            //     // rootGlobeViewClass = 'SpreadSheetRootGlobeView';
            //     break;
            // }
            // case "points":
            // {  
            //     files = Application.globeViews.spreadSheet.files;
            //     //rootGlobeViewClass = 'GoogleTrendsRootGlobeView';
            //     rootGlobeViewClass = 'SpreadSheetGlobeView';
            //     break;
            // }
            // case "dynamic":
            // {
            //     files = Application.globeViews.dynamic.files;
            //     rootGlobeViewClass = 'dynamic';
            //     break;
            // }
            // case "graph":
            // {
            //     files = Application.globeViews.flightPath.files;
            //     rootGlobeViewClass = 'flightpaths';
            //     break;
            // }

             case "countries":
             case "points":
             case "dynamic":
             case "graph":
            {  
               // files = Application.globeViews.googleTrends.files;
                rootViewClass = 'RootGlobeView';
                // rootGlobeViewClass = 'SpreadSheetRootGlobeView';
                break;
            }
           
        }

        //    var that = this;
          //  require(files, function() {

                this.rootView = new Application[rootViewClass](config);
                this.$el.prepend(this.rootView.$el);
//});
        }
});