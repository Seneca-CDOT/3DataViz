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

        // Application._vent.on('controlpanel', this.submitOn.bind(this));
        Application._vent.on('controlpanel', this.submitOn.bind(this));
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);
        return this;
    },
    submitOn: function(config) {

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

        this.rootView = new Application['RootGlobeView'](config);
        this.$el.prepend(this.rootView.$el);
    }
});