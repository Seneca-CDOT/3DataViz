Application.ControlElementsGlobeView = Backbone.View.extend({
    initialize: function() {},
    render: function() {
        return this;
    },
    events: {
        'mousedown': 'action'
    },
    destroy: function() {

        this.remove();
        this.unbind();
        delete this.$el;
        delete this.el;
    },
    action: function(e) {

    }

});

Application.SearchField = Application.ControlElementsGlobeView.extend({
    tagName: 'input',
    id: 'search',
    className: 'form-control',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
    },
    render: function() {

        return this;
    }


});

Application.TweetsButton = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    id: 'tweets',
    className: 'btn btn-primary',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);

    },
    render: function() {

        this.$el.text('tweets');
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this);

        e.stopPropagation();

        var tweetscollection = new Application.StaticTwitterCountriesCollection();

        tweetscollection.fetch({

            success: function(response) {

                Application.router.rootGlobeView.views[0].numToScale(response.models);
            },
            error: function(err, response) {

                console.log(err);

            }
        });

    }

});


Application.ResetButton = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    id: 'reset',
    className: 'btn btn-danger',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
    },
    render: function() {

        this.$el.text('reset');
        return this;
    }

});