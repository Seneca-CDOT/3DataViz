Application.ControlElementsGlobeView = Backbone.View.extend({
    initialize: function(config) {
        this._vent = config.event;
        this.name = '';
        this.userInput = config.userInput;

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

        this.name = this.$el.attr('id');

        // if (!this.userInput.hasOwnProperty(this.name)) {

        //     Object.defineProperty(this.userInput, this.name, {

        //         value: value,
        //         writable: true,
        //     });

        // } else {

            this.userInput[this.name] = value;
// 
        // }

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

        //console.log( this.$el.val() );

        this.addToConfig(this.$el.val());

    }


});

Application.Button = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    initialize: function(config) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, config);
    },
    render: function() {
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

        this._vent.trigger('controlpanel', [this.userInput]);


    }
});

Application.DropDownList = Application.ControlElementsGlobeView.extend({
    tagName: 'select',
    initialize: function(config, list) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, config);
        this.$el.on('change', this.action.bind(this));
        this.list = list;
    },
    events: {},
    render: function() {
        this.name = this.$el.attr('id');

        var that = this;

        this.$el.append("<option value='' selected disabled>Choose a " + this.name + "</option>");

        $.each(that.list, function(index, item) {

            that.$el.append("<option value='" + item + "'>" + item + "</option>");
        });

        return this;
    },
    action: function(e) {

        var that = this;

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

        $.each(e.target.children, function(index, option) {

            if (option.selected == true && e.target.value != "") {

                // console.log(e.target.value);

                that.addToConfig(e.target.value);

                that._vent.trigger('controlpanelsubview/' + that.name, [e.target.value]);

            }

        });

    }
});