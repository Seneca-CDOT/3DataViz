Application.ControlElementsGlobeView = Backbone.View.extend({
    initialize: function(viewConfig) {
        this.viewConfig = viewConfig;

    },
    render: function() {
        return this;
    },
    events: {
        'mousedown': 'action'
    },
    destroy: function() {
        this.viewConfig = null;
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
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
        this.$el.on('keyup', this.disableVisView.bind(this));
    },
    render: function() {

        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);

    },
    grabInput: function() {

        this.addToConfig(this.$el.val());

    },
    disableVisView: function() {

        Application._vent.trigger('controlpanel/input/changed');
        Application._vent.trigger('matcher/off');
    }

});

Application.FileUpload = Application.ControlElementsGlobeView.extend({
    tagName: 'div',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);

        this.$btnfile = $('<div class="btn btn-default btn-file">Choose File</div>');

        this.$file = $('<input id="fileUpload" type="file">');
        this.$file.on('change', this.handleFile.bind(this));
        this.$btnfile.on('click', this.action.bind(this));
        this.$btnfile.append(this.$file);

        this.$el.append(this.$btnfile);

        this.$list = $('<p id="fileName"></p>');
        this.$el.append(this.$list);

        this.$errMsg = $('<p id="fileNameMsg"></p>');
        this.$el.append(this.$errMsg);

    },
    render: function() {
        return this;
    },
    getFile: function() {
        return this.$file[0].files[0];
    },
    handleFile: function() {
        this.$list.text(this.getFile().name).show();
    },
    changeErrMsg: function(text){
        this.$errMsg.text(text);
    },
    action: function() {

        Application._vent.trigger('controlpanel/input/changed');
        Application._vent.trigger('matcher/off');
    },
});

Application.BoxExplorer = Application.ControlElementsGlobeView.extend({
    tagName: 'div',
    initialize: function(viewConfig) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
        var that = this;
        this.fileInfo;

        this.$btnfile = $('<div id="box-select"></div>');
        this.boxSelect = new BoxSelect({
            clientId: "2cef1xake819jgxn76fpd9303j0ngmrs",
            linkType: "direct",
            multiselect: false
        });
        this.boxSelect.success(function(response){
            that.boxSelect.closePopup();
            $("#fileName").text(response[0].name).show();
            that.fileInfo = response[0];
            that.trigger('success');
        });

        this.$btnfile.on('click', this.handleFile.bind(this));
        this.$el.append(this.$btnfile);

        this.$list = $('<p id="fileName"></p>');
        this.$el.append(this.$list);

        this.$errMsg = $('<p id="fileNameMsg"></p>');
        this.$el.append(this.$errMsg);
        
    },
    render: function() {
        return this;
    },
    changeErrMsg: function(text){
        this.$errMsg.text(text);
    },
    getFileInfo: function(){
        return this.fileInfo;
    },
    handleFile: function(){
        this.boxSelect.launchPopup();
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
        Application._vent.trigger('matcher/off');

    },
    grabInput: function() {

        this.addToConfig(this.$el.val());

    }


});

Application.Help = Application.ControlElementsGlobeView.extend({
    tagName: 'a',
    className: 'helpButton',
    initialize: function() {},
    events: {
        'mousedown': 'action'
    },
    render: function() {
        this.$el.append('<span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span>');
        return this;
    },
    action: function(e) {
        $("#instruction").fadeToggle();
        Application._vent.trigger('matcher/off');
    }
});

Application.Button = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    className: 'btn btn-primary button',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
    },
    events: {

        'mousedown': 'action'
    },
    render: function() {
        return this;
    },
    action: function(e) {

        Application.ControlElementsGlobeView.prototype.action.call(this, e);
        Application._vent.trigger('matcher/off');
    }
});



Application.VizButton = Application.ControlElementsGlobeView.extend({
    tagName: 'button',
    initialize: function() {
        Application.ControlElementsGlobeView.prototype.initialize.call(this);
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
        this.viewConfig = viewConfig;
        // this.config = config; // list of the options
        // this.name = null; // name of the option in the list
    },
    events: {

        'change': 'action'
    },
    render: function() {

        var that = this;
        //this.name = this.$el.attr('id');

        this.$el.append("<option value='' selected disabled></option>");
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
                Application._vent.trigger('controlpanel/subview/' + that.viewConfig.name, option.innerHTML);
            }
        });
    }
});
