Application.ControlElementsGlobeView = Backbone.View.extend({
    initialize: function(viewConfig) {
        //this._vent = config.event;
        //this.name = '';
        this.viewConfig = viewConfig;

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

        Application.userConfig[this.viewConfig.name] = value;
    }

});

Application.InputField = Application.ControlElementsGlobeView.extend({
    tagName: 'input',
    initialize: function(viewConfig) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
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

Application.DateTime = Application.ControlElementsGlobeView.extend({
    tagName: 'input',
    initialize: function(viewConfig) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
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

Application.Button = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    className: 'btn btn-primary button',
    initialize: function(viewConfig) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
    },
    events: {

        'mousedown':'action'
    },
    render: function() {
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

      //  Application._vent.trigger('controlpanel/parse');
    }
});



Application.VizButton = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    initialize: function(viewConfig) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
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
    initialize: function(viewConfig) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
       // this.config = config; // list of the options
       // this.name = null; // name of the option in the list
    },
    events: {

        'change': 'action'
    },
    render: function() {

        var that = this;
        //this.name = this.$el.attr('id');

        this.$el.append("<option value='' selected disabled>Choose a " + this.viewConfig.name + "</option>");
        $.each(this.viewConfig.list, function(index, item) {

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
                Application._vent.trigger('controlpanelsubview/' + that.viewConfig.name);
            }
        });
    }
});