var Application = Application || {};

/**
 * Application.GlobeRouter (Controller)
 * Perform functions besed on the parameters from URL.
 * @return null
 */
Application.RootRouter = Backbone.Router.extend({

    routes: {
        "": "initRootView"
    },
    initRootView: function() {

        this.view = new Application.RootView();
        $("#applicationRegion").append(this.view.render().$el);

    }

    // request: function (id) { 

    //     Application.router.rootGlobeView.globeView.collection.trigger("grab", id );
    // }

});