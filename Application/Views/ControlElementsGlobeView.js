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

        if (e) e.stopPropagation();

    }

});

// StaticTwitter

Application.InputField = Application.ControlElementsGlobeView.extend({
    tagName: 'input',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
    },
    render: function() {

        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

    }


});

Application.Button = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
    },
    render: function() {
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

    }
});


// Application.TweetsButton = Application.ControlElementsGlobeView.extend({
//     tagName: 'button',
//     id: 'tweets',
//     className: 'btn btn-primary',
//     initialize: function() {
//         Application.ControlElementsGlobeView.prototype.initialize.call(this);

//     },
//     render: function() {

//         this.$el.text('tweets');
//         return this;
//     },
//     action: function(e) {

//         Application.ControlElementsGlobeView.prototype.action.call(this,e);

//         var tweetscollection = new Application.StaticTwitterCountriesCollection();

//         tweetscollection.fetch({

//             success: function(response) {

//                 Application.router.rootGlobeView.views[0].numToScale(response.models);
//             },
//             error: function(err, response) {

//                 console.log(err);

//             }
//         });

//     }

// });


// Application.ResetButton = Application.ControlElementsGlobeView.extend({
//     tagName: 'button',
//     id: 'reset',
//     className: 'btn btn-danger',
//     initialize: function() {
//         Application.ControlElementsGlobeView.prototype.initialize.call(this);
//     },
//     render: function() {

//         this.$el.text('reset');
//         return this;
//     },
//     action: function(e) {

//         Application.ControlElementsGlobeView.prototype.action.call(this,e);

//         Application.router.rootGlobeView.views[0].resetGlobe();

//         Application.router.rootGlobeView.views[0].destroy();
//     }

// });

// SpreadSheet

// Application.URLField = Application.ControlElementsGlobeView.extend({
//     tagName: 'input',
//     id: 'url',
//     className: 'form-control',
//     initialize: function() {
//         Application.ControlElementsGlobeView.prototype.initialize.call(this);
//     },
//     render: function() {

//         return this;
//     },
//     action: function(e) {

//         Application.ControlElementsGlobeView.prototype.action.call(this, e);


//     }


// });

// Application.SubmitButton = Application.ControlElementsGlobeView.extend({
//     tagName: 'button',
//     id: 'submit',
//     className: 'btn btn-primary',
//     initialize: function() {
//         Application.ControlElementsGlobeView.prototype.initialize.call(this);

//     },
//     render: function() {

//         this.$el.text('submit');
//         return this;
//     },
//     action: function(e) {
//         Application.ControlElementsGlobeView.prototype.action.call(this,e);

//         var val = Application.router.rootGlobeView.views[0].controlPanel.urlfield.el.value;

//         if (val == '') val = '13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg'; // temporary

//         Application.router.navigate('globeView/spreadsheet/request/' + val, true );


//         // //console.log(val);

//         // Application.router.rootGlobeView.views[0].updateCollection(val);

//     }

// });