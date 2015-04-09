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

// StaticTwitter

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

// SpreadSheet

Application.URLField = Application.ControlElementsGlobeView.extend({
    tagName: 'input',
    id: 'url',
    className: 'form-control',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
    },
    render: function() {

        return this;
    },
    action: function(e) {

        e.stopPropagation();
    }


});

Application.SubmitButton = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    id: 'submit',
    className: 'btn btn-primary',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);

    },
    render: function() {

        this.$el.text('submit');
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this);

        e.stopPropagation();

        var val = Application.router.rootGlobeView.views[0].controlPanel.urlfield.el.value;

        console.log(val);

        var collection = new Application.SpreadSheetCollection();

        collection.url = 'https://spreadsheets.google.com/feeds/cells/' + val + '/1/public/basic?alt=json';

        collection.fetch({

            success: function(response) {

                // console.log(response);

                Application.router.rootGlobeView.views[0].addPoints(response.models);
            },
            error: function(err, response) {

                console.log(err);

            }
        });

    }

});