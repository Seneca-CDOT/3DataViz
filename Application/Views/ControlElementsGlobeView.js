Application.ControlElementsGlobeView = Backbone.View.extend({
    initialize: function(config) {
        //this._vent = config.event;
        //this.name = '';
        this.config = config;

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

    },
    addToConfig: function(value) {

        this.config.userChoice[this.config.currentAttribute] = value;
    }

});

Application.InputField = Application.ControlElementsGlobeView.extend({
    tagName: 'input',
    initialize: function(config) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, config);
        this.$el.on('keyup', this.grabInput.bind(this));
    },
    render: function() {

        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

    },
    grabInput: function() {

        this.addToConfig(this.$el.val());

    }


});

Application.ParseButton = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    className: 'btn btn-primary button',
    initialize: function(config) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, config);
    },
    events: {

        'mousedown':'action'
    },
    render: function() {
        this.$el.text("submit");
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

      //  Application._vent.trigger('controlpanel/parse');
    }
});

Application.VizButton = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    initialize: function(config) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, config);
    },
    render: function() {
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

       // Application._vent.trigger('controlpanel', this.userInput);
    }
});

Application.DropDownList = Application.ControlElementsGlobeView.extend({
    tagName: 'select',
    className: 'form-control',
    initialize: function(config) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, config);
       // this.config = config; // list of the options
       // this.name = null; // name of the option in the list
    },
    events: {

        'change': 'action'
    },
    render: function() {

        var that = this;
        //this.name = this.$el.attr('id');

        this.$el.append("<option value='' selected disabled>Choose a " + this.config.currentAttribute + "</option>");
        $.each(that.config.list, function(index, item) {

            that.$el.append("<option value='" + item + "'>" + item + "</option>");
        });
        return this;
    },
    action: function(e) {

        var that = this;

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

        $.each(e.target.children, function(index, option) {

            if (option.selected == true && e.target.value != "") {

                that.addToConfig(e.target.value);
                Application._vent.trigger('controlpanelsubview/' + that.config.currentAttribute);
            }
        });
    }
});