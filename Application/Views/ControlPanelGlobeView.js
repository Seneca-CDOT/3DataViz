Application.ControlPanelRootView = Backbone.View.extend({
    tagName: 'div',
    id: 'panel',
    initialize: function(config) {
        this._vent = config.event;
        config.userInput = {}; //configuration object for storing user's activities in control panel
        this.userInput = config.userInput;
        this.mainconfigview = new Application.MainConfigView(config);
    },
    render: function() {
        this.$el.append(this.mainconfigview.render().$el);
        return this;
    },
    destroy: function() {}
});

Application.MainConfigView = Backbone.View.extend({
    tagName: 'div',
    id: 'configList',
    initialize: function(config) {

        this._vent = config.event;
        this.config = config;
        this.subview;

        this.sourceslist = ['twitter', 'csv', 'spreadsheet', 'trends'];
        this.dataSourcesList = new Application.DropDownList(config, this.sourceslist);
        this.dataSourcesList.$el.attr('id', 'dataSourcesList');
        this.dataSourcesList.$el.attr('class', 'form-control');

        this.vislist = ['geometry', 'texture'];
        this.visualizationList = new Application.DropDownList(config, this.vislist);
        this.visualizationList.$el.attr('id', 'visualizationList');
        this.visualizationList.$el.attr('class', 'form-control');

        this.temlist = ['spreadSheet', 'staticTwitter', 'flightPath', 'dynamic', 'googleTrends'];
        this.templatesList = new Application.DropDownList(config, this.temlist);
        this.templatesList.$el.attr('id', 'templatesList');
        this.templatesList.$el.attr('class', 'form-control');

        this._vent.on('controlpanelsubview', this.addSubView.bind(this));

    },
    render: function() {
        this.$el.append(this.dataSourcesList.render().$el);
        this.$el.append(this.visualizationList.render().$el);
        this.$el.append(this.templatesList.render().$el);
        return this;
    },
    destroy: function() {

        this.remove();
        this.unbind();
        delete this.$el;
        delete this.el;
    },
    addSubView: function(value) {

        this.subview = this.getSubView(value);
        if (typeof this.subview !== 'undefined' ) {
        //this.$el.empty();
        this.$el.append(this.subview.render().$el);
    }

    },
    getSubView: function(value) {

        if (this.subview !== undefined ) this.subview.destroy();

        switch (value[0]) {

            case 'twitter':
                 this.subview = new Application.DynamicTwitterControlPanel(this.config);
                break;
            case 'csv':
                this.subview = new Application.CSVControlPanel(this.config);
                break;
            case 'spreadsheet':
                this.subview = new Application.SpreadSheetControlPanel(this.config);
                break;
            case 'trends':
                this.subview = new Application.GoogleTrendsControlPanel(this.config);
                break;
        }

        return this.subview;

    }

});

Application.ButtonsView = Backbone.View.extend({
    id: 'buttons',
    initialize: function(config) {

        this._vent = config.event;
        this.userInput = config.userInput;

    },
    render: function() {
        
        return this;
    },
    destroy: function() {

        this.$el.empty();
    }

});

Application.CSVControlPanel = Application.ButtonsView.extend({

    initialize: function(config) {
        Application.ButtonsView.prototype.initialize.call(this, config);
        
        this.submitbtn = new Application.Button(config);
        this.submitbtn.$el.attr('id', 'submit');
        this.submitbtn.$el.attr('class', 'btn btn-primary');
        this.submitbtn.$el[0].innerText = 'submit';
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.submitbtn.render().$el);
        return this;
    },
    submitAction: function (e) {}

});

Application.DynamicTwitterControlPanel = Application.ButtonsView.extend({

    initialize: function(config) {
        Application.ButtonsView.prototype.initialize.call(this, config);

        this.search = new Application.InputField(config);
        this.search.$el.attr('id', 'url');
        this.search.$el.attr('class', 'form-control');
        this.search.$el.attr('placeholder', 'Submit the URL');
        this.search.$el.on('mousedown', this.searchFieldAction.bind(this));
        
        this.submitbtn = new Application.Button(config);
        this.submitbtn.$el.attr('id', 'submit');
        this.submitbtn.$el.attr('class', 'btn btn-primary');
        this.submitbtn.$el[0].innerText = 'submit';
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));
        
        // this.resetbtn = new Application.Button(config);
        // this.resetbtn.$el.attr('id', 'reset');
        // this.resetbtn.$el.attr('class', 'btn btn-danger');
        // this.resetbtn.$el[0].innerText = 'reset';
        // this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.search.render().$el);
        this.$el.append(this.submitbtn.render().$el);
      //  this.$el.append(this.resetbtn.render().$el);
        return this;
    },
    searchFieldAction: function(e) {},
    submitAction: function (e) {},
    resetAction: function (e) {} 

});

Application.SpreadSheetControlPanel = Application.ButtonsView.extend({

    initialize: function(config) {
        Application.ButtonsView.prototype.initialize.call(this, config);

        this.urlfield = new Application.InputField(config);
        this.urlfield.$el.attr('id', 'url');
        this.urlfield.$el.attr('class', 'form-control');
        this.urlfield.$el.attr('placeholder', 'Submit the URL');
        this.urlfield.$el.on('mousedown', this.urlFieldAction.bind(this));

        this.submitbtn = new Application.Button(config);
        this.submitbtn.$el.attr('id', 'submit');
        this.submitbtn.$el.attr('class', 'btn btn-primary');
        this.submitbtn.$el[0].innerText = 'submit';
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        // this.resetbtn = new Application.Button(config);
        // this.resetbtn.$el.attr('id', 'reset');
        // this.resetbtn.$el.attr('class', 'btn btn-danger');
        // this.resetbtn.$el[0].innerText = 'reset';
        // this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.urlfield.render().$el);
        this.$el.append(this.submitbtn.render().$el);
       // this.$el.append(this.resetbtn.render().$el);
        return this;
    },
    urlFieldAction: function() {

    },
    submitAction: function(e) {

        e.preventDefault();

        if (this.urlfield.$el.val().trim() == '') {

            this.urlfield.$el.focus();
            return;
        }

        var key = this.parseKey(this.urlfield.$el.val());

        this._vent.trigger('controlpanel/submit', key);

    },
    resetAction: function() {

        this.urlfield.$el.val('');
        this._vent.trigger('controlpanel/reset');

    },
    parseKey: function(url) {

        var startindex = 0;
        var endindex = 0;

        for (var i = 0; i < url.length; i++) {


            if (url[i] === "/" && url[i + 1] === "d" && url[i + 2] === "/") {

                startindex = (i + 3);
                i = i + 3;

            }
            if (url[i] === "/" && startindex !== 0) {

                endindex = i;
            }

            if (endindex !== 0) break;
        }

        var key = url.slice(startindex, endindex);

        return key;

    }

});

Application.GoogleTrendsControlPanel = Application.ButtonsView.extend({

    initialize: function(config) {
        Application.ButtonsView.prototype.initialize.call(this, config);

        this.keywordfield = new Application.InputField(config);
        this.keywordfield.$el.attr('id', 'keyword');
        this.keywordfield.$el.attr('class', 'form-control');
        this.keywordfield.$el.attr('placeholder', 'Enter the keyword');
        this.keywordfield.$el.on('keyup', this.KeywordFieldAction.bind(this));

        this.submitbtn = new Application.Button(config);
        this.submitbtn.$el.attr('id', 'submit');
        this.submitbtn.$el.attr('class', 'btn btn-primary');
        this.submitbtn.$el[0].innerText = 'submit';
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        // this.resetbtn = new Application.Button(config);
        // this.resetbtn.$el.attr('id', 'reset');
        // this.resetbtn.$el.attr('class', 'btn btn-danger');
        // this.resetbtn.$el[0].innerText = 'reset';
        // this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.keywordfield.render().$el);
        this.$el.append(this.submitbtn.render().$el);
        //this.$el.append(this.resetbtn.render().$el);
        return this;
    },
    KeywordFieldAction: function(e) {

        if (e.which == 13) {

            this.submitAction(e);
        }

    },
    submitAction: function(e) {

        e.preventDefault();

        if (this.keywordfield.$el.val().trim() == '') {

            this.keywordfield.$el.focus();

            return;
        }

        var key = this.parseKey(this.keywordfield.$el.val());

        this._vent.trigger('controlpanel/submit', key);

    },
    resetAction: function() {

        this.keywordfield.$el.val('');
        this._vent.trigger('controlpanel/reset');

    },
    parseKey: function(keyword) {

        keyword = keyword.trim().replace(/ /g, ',');
        return keyword;

    }

});