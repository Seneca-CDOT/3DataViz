Application.ControlElementsGlobeView = Backbone.View.extend({
    initialize: function() {

    },
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

Application.DropDownList = Application.ControlElementsGlobeView.extend({
    tagName: 'select',
    initialize: function( config ) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
        this.$el.on('change', this.action.bind(this));
        this.name = config.name;
        this._vent = config.event;
    },
    events: {},
    render: function(list) {

        var that = this;

        this.$el.append("<option value='' selected disabled>Choose a " + this.name + "</option>");

        $.each(list, function(index, item) {

            that.$el.append("<option value='" + item + "'>" + item + "</option>");
        });

        return this;
    },
    action: function(e) {

        var that = this;

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

        $.each( e.target.children, function (index, option) {
           
           if (option.selected == true && e.target.value != "") {

            console.log( e.target.value );

            that._vent.trigger('controls/' + this.name, [ e.target.value ] );

        }

        });

    }
});
