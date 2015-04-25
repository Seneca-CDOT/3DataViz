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