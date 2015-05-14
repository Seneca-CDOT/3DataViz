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
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
        this.$el.on('change', this.action.bind(this));
    },
    events: {},
    render: function(list) {

        var that = this;

        $.each(list, function(index, item) {

            that.$el.append("<option value='" + item + "'>" + item + "</option>");
        });

        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

        $.each( e.target.children, function (index, option) {
           
           if (option.selected == true ) {

            console.log( e.target.value );

            //Application.router.navigate('globeView/' + e.target.value, true);
        }

        });

    }
});
