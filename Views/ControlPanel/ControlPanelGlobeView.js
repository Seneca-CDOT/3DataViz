Application.NotificationsCenter = Backbone.View.extend({
    tagName: 'div',
    id: 'notificationsBox',
    initialize: function() {
        Application._vent.on('controlpanel/message/on', this.showMessage.bind(this));
        Application._vent.on('controlpanel/message/off', this.removeMessage.bind(this));
        this.$el.hide();
    },
    render: function() {

        return this;
    },
    showMessage: function(message) {
        this.$el.show();
        this.$el.empty();
        this.$el.append('<div class="notification">' + message + '</div>');
    },
    removeMessage: function() {
        this.$el.empty();
        this.$el.hide();
    },
    destroy: function() {

        Application._vent.unbind('controlpanel/message/on');
        Application._vent.unbind('controlpanel/message/off');
    }
});

Application.ControlPanelRootView = Backbone.View.extend({
    tagName: 'div',
    id: 'panel',
    initialize: function() {

        this.visualizationsView = null;
        this.dataSourcesView = null;
        this.addDataSourcesView();

        Application._vent.on('data/parsed', this.addVisualizationsView.bind(this));
        Application._vent.on('controlpanel/subview/dataSource', this.destroyVisualizationView.bind(this));
        Application._vent.on('controlpanel/input/changed', this.destroyVisualizationView.bind(this));
        // Application._vent.on('visualize', this.reset.bind(this));
        this.$el.append('<a id="help" href="javasctip:void(0);">i</a>');
        $help = '<a id="help" href="javasctip:void(0);"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></a>';

        $("#help").on('click', function(){
            console.log("helo?");
            $("#instruction").fadeToggle();
        });

    },
    render: function() {
        this.$el.append(this.dataSourcesView.render().$el);
        // this.$el.append(this.visualizationsView.render().$el);
        return this;
    },
    addDataSourcesView: function() {
        if (this.dataSourcesView) this.dataSourcesView.destroy();
        this.dataSourcesView = new Application.DataSourcesView();
    },
    addVisualizationsView: function(viewConfig) {

        if (this.visualizationsView)

            this.visualizationsView.destroy();
        this.visualizationsView = new Application.VisualizationsView(viewConfig);
        this.$el.append(this.visualizationsView.render().$el);

        // Application._vent.unbind('data/parsed');

    },
    destroyVisualizationView: function() {

        if (this.visualizationsView) {

            this.visualizationsView.destroy();
            this.visualizationsView = null;
        }

    },
    reset: function() {
        Application._vent.on('data/parsed', this.addVisualizationsView.bind(this));
        if (this.visualizationsView != null) {
            this.visualizationsView.destroy();
            this.visualizationsView = null;
        }
        if (this.dataSourcesView.subview != null) {
            this.dataSourcesView.subview.destroy();
            this.dataSourcesView.subview = null;
        }
        this.dataSourcesView.$el.children()[0].selectedIndex = 0;
    },
    destroy: function() {}
});

Application.DataSourcesView = Backbone.View.extend({
    tagName: 'div',
    className: 'configList',
    initialize: function() {

        this.subview = null;
        //this.templateView = null;

        this.viewConfig = {
            name: 'dataSource',
            list: ['twitterDB', 'twitterLive', 'csv', 'spreadSheet', 'googleTrends']
        };
        this.dataSourcesList = new Application.DropDownList(this.viewConfig);
        this.dataSourcesList.$el.attr('id', 'dataSourcesList');
        this.$el.append('<label for="dataSourcesList" class="label">CHOOSE A DATA SOURCE</label>');

        Application._vent.on('controlpanel/subview/dataSource', this.addSubView.bind(this));
        //   Application._vent.on('data/parsed', this.addTemplateListView.bind(this));

    },
    render: function() {
        this.$el.append(this.dataSourcesList.render().$el);
        // this.$el.append(this.visualizationList.render().$el);
        // this.$el.append(this.templatesList.render().$el);
        return this;
    },
    destroy: function() {

        this.remove();
        this.unbind();
        delete this.$el;
        delete this.el;

    },
    addSubView: function() {

        if (this.subview) this.subview.destroy();

        this.subview = this.getSubView();
        this.$el.append(this.subview.render().$el);

    },
    // addTemplateListView: function(pData) {

    //     console.log("addTemplateListView");
    //     console.log(pData);

    //     this.subview = this.getTemplateListView(this.config);
    //     if (typeof this.subview !== 'undefined') {
    //         this.$el.append(this.subview.render().$el);
    //     }

    // },
    // addTemplateOptions: function(value) {

    //     this.subview = this.getSubView(value);
    //     if (typeof this.subview !== 'undefined') {
    //         this.$el.append(this.subview.render().$el);
    //     }

    // },
    getSubView: function() {

        this.viewConfig.subView = {
            name: 'input'
        };

        var subViewConfig = this.viewConfig.subView;

        switch (Application.userConfig.dataSource) {

            case 'twitterDB':
                this.subview = new Application.DynamicTwitterDBControlPanel(subViewConfig);
                break;
            case 'twitterLive':
                this.subview = new Application.DynamicTwitterLiveControlPanel(subViewConfig);
                break;
            case 'csv':
                this.subview = new Application.CSVControlPanel(subViewConfig);
                break;
            case 'spreadSheet':
                this.subview = new Application.SpreadSheetControlPanel(subViewConfig);
                break;
            case 'googleTrends':
                this.subview = new Application.GoogleTrendsControlPanel(subViewConfig);
                break;
        }

        return this.subview;

    },
    // getTemplateListView: function(value) {

    //     if (this.templateview !== undefined) this.templateview.destroy();
    //     this.templateview = new Application.TemplateListControlPanel(this.config);

    //     return this.templateview;

    // }


});

Application.VisualizationsView = Backbone.View.extend({
    tagName: 'div',
    className: 'configList',
    initialize: function(viewConfigs) {

        this.subview = null;
        this.visualizebtn = null;
        this.viewConfigs = viewConfigs;

        this.visualizationList = new Application.DropDownList(this.viewConfigs.vizType);
        this.visualizationList.$el.attr('id', 'visualizationList');
        this.labelForViz = '<label for="visualizationList" class="label">CHOOSE A VISUALIZATION</label>';

        Application._vent.on('controlpanel/subview/vizType', this.addSubView.bind(this));



    },
    render: function() {

        this.$el.append(this.labelForViz);
        this.$el.append(this.visualizationList.render().$el);

        return this;
    },
    destroy: function() {

        this.remove();
        this.viewConfigs = null;
        this.visualizationList = null;
        this.subview = null;
        Application._vent.unbind('controlpanel/subview/vizType');
    },
    addSubView: function() {

        if (this.subview) {
            this.labelForTemplates.remove();
            this.subview.destroy();
        }

        if (this.visualizebtn) this.visualizebtn.destroy(); // to rework

        this.subview = this.getSubView();


    },
    getSubView: function() {
        var that = this;

        this.subview = new Application.DropDownList(this.viewConfigs.vizLayer);
        this.subview.$el.attr('id', 'templatesList');
        this.labelForTemplates = $('<label for="templatesList" class="label">CHOOSE A TEMPLATE</label>');
        this.$el.append(this.labelForTemplates);

        this.$el.append(this.subview.render().$el);

        this.visualizebtn = new Application.Button(this.viewConfigs.vizLayer); // to do submit button in elements

        this.visualizebtn.$el.text('VISUALIZE');
        this.visualizebtn.$el.on('mousedown', this.submitAction.bind(this));
        this.$el.append(this.visualizebtn.render().$el);

        return this.subview;

    },
    submitAction: function(e) {
        Application._vent.trigger('visualize');
    }

});

Application.ButtonsView = Backbone.View.extend({
    id: 'buttons',
    initialize: function(viewConfig) {
        this.viewConfig = viewConfig;

    },
    render: function() {

        return this;
    },
    destroy: function() {

        this.viewConfig = null;
        this.remove();
        //this.$el.empty();
    }
});

Application.CSVControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {

        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('SUBMIT');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.submitbtn.render().$el);
        return this;
    },
    submitAction: function() {

        Application._vent.trigger('controlpanel/parse');
    },
    destroy: function() {
        this.submitbtn.destroy();

    }
});

Application.DynamicTwitterLiveControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {
        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.search = new Application.InputField(viewConfig);
        this.search.$el.attr('class', 'form-control userInput');
        this.search.$el.attr('id', 'search');
        this.search.$el.on('keyup', this.searchFieldAction.bind(this));
        this.labelForSearch = $('<label for="search" class="label">ENTER A SEARCH KEYWORD</label>');

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('SUBMIT');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.labelForSearch);
        this.$el.append(this.search.render().$el);
        this.$el.append(this.submitbtn.render().$el);
        //  this.$el.append(this.resetbtn.render().$el);
        return this;
    },
    searchFieldAction: function(e) {

        if (e.which == 13) {

            this.submitAction(e);
        }

    },
    submitAction: function(e) {

        var key = this.search.$el.val();
        Application.userConfig.input = key;
        Application._vent.trigger('controlpanel/parse');

    },
    destroy: function() {
        this.submitbtn.destroy();
        this.search.destroy();
        this.labelForSearch.remove();

    }
});

Application.DynamicTwitterDBControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {
        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.requestTimeFrom();
        this.requestTimeTo();

        this.timeFrom = new Application.InputField(viewConfig);
        this.timeFrom.$el.attr('class', 'form-control userInput');
        this.timeFrom.$el.attr('id', 'timeFrom');
        this.timeFrom.$el.on('keyup', this.timeFieldAction.bind(this));
        this.labelForTimeFrom = $('<label for="timeFrom" class="label">ENTER INITIAL TIME</label>');

        this.timeTo = new Application.InputField(viewConfig);
        this.timeTo.$el.attr('class', 'form-control userInput');
        this.timeFrom.$el.attr('id', 'timeTo');
        this.timeTo.$el.on('keyup', this.timeFieldAction.bind(this));
        this.labelForTimeTo = $('<label for="timeTo" class="label">ENTER FINAL TIME</label>');

        this.search = new Application.InputField(viewConfig);
        this.search.$el.attr('class', 'form-control userInput');
        this.search.$el.on('keyup', this.searchFieldAction.bind(this));
        this.labelForSearch = $('<label for="search" class="label">ENTER A SEARCH KEYWORD</label>');

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('SUBMIT');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.labelForTimeFrom);
        this.$el.append(this.timeFrom.render().$el);
        this.$el.append(this.labelForTimeTo);
        this.$el.append(this.timeTo.render().$el);
        this.$el.append(this.labelForSearch);
        this.$el.append(this.search.render().$el);
        this.$el.append(this.submitbtn.render().$el);
        //  this.$el.append(this.resetbtn.render().$el);
        return this;
    },
    searchFieldAction: function(e) {

        if (e.which == 13) {

            this.submitAction(e);
        }

    },
    timeFieldAction: function() {


    },
    submitAction: function(e) {

        var key = this.search.$el.val();
        var from = this.timeFrom.$el.val();
        var to = this.timeTo.$el.val();
        Application.userConfig.input = key;
        Application.userConfig.timeFrom = from;
        Application.userConfig.timeTo = to;
        Application._vent.trigger('controlpanel/parse');

    },
    requestTimeFrom: function() {
        var that = this;

        var path = 'http://threedataviz.herokuapp.com/';
        // var path = 'http://localhost:5000/';

        $.get(path + 'twitterDB/apple/timefrom').done(function(data) {
            console.log(data[0].timestamp_ms);
            // console.log(new Date(data[0].timestamp_ms));
            var datetime = that.convertStampToDateTime(data[0].timestamp_ms);
            that.timeFrom.$el.val(datetime);
        });
    },
    requestTimeTo: function() {
        var that = this;
        var path = 'http://threedataviz.herokuapp.com/';
        // var path = 'http://localhost:5000/';

        $.get(path + 'twitterDB/apple/timeto').done(function(data) {
            console.log(data[0].timestamp_ms);
            var datetime = that.convertStampToDateTime(data[0].timestamp_ms)
            that.timeTo.$el.val(datetime);
        });
    },
    convertStampToDateTime: function(timestamp) {

        var d = new Date(Number(timestamp));
        var datetime = d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        return datetime;

    },
    convertDateTimeToStamp: function(datetime) {

        return new Date(datetime);

    },
    destroy: function() {
        this.submitbtn.destroy();
        this.search.destroy();
        this.labelForSearch.remove();
        this.timeFrom.destroy();
        this.labelForTimeFrom.remove();
        this.timeTo.destroy();
        this.labelForTimeTo.remove();

    }
});

Application.SpreadSheetControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {
        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.urlfield = new Application.InputField(viewConfig);
        this.urlfield.$el.attr('class', 'form-control userInput');
        this.urlfield.$el.attr('id', 'key');
        this.urlfield.$el.val("13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg");
        this.urlfield.$el.on('mousedown', this.urlFieldAction.bind(this));
        this.labelForKey = $('<label for="key" class="label">ENTER A KEY</label>');

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('SUBMIT');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        // this.resetbtn = new Application.Button(config);
        // this.resetbtn.$el.attr('id', 'reset');
        // this.resetbtn.$el.attr('class', 'btn btn-danger');
        // this.resetbtn.$el[0].innerHTML = 'reset';
        // this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.labelForKey);
        this.$el.append(this.urlfield.render().$el);
        this.$el.append(this.submitbtn.render().$el);
        // this.$el.append(this.resetbtn.render().$el);
        return this;
    },
    urlFieldAction: function(e) {
        if (e.which == 13) {
            this.submitAction(e);
        }
    },
    submitAction: function(e) {

        e.preventDefault();

        if (this.urlfield.$el.val().trim() == '') {

            this.urlfield.$el.focus();
            return;
        }

        var key = this.parseKey(this.urlfield.$el.val());
        Application.userConfig.input = key;

        Application._vent.trigger('controlpanel/parse');

    },
    resetAction: function() {

        this.urlfield.$el.val('');
        Application._vent.trigger('controlpanel/reset');

    },
    parseKey: function(url) {

        if (url.match(/^http:\/\/|^https:\/\//g)) {

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

        } else {
            key = url
        }

        return key;

    },
    destroy: function() {
        this.submitbtn.destroy();
        this.urlfield.destroy();
        this.labelForKey.remove();
    }

});

Application.GoogleTrendsControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {
        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.keywordfield = new Application.InputField(viewConfig);
        this.keywordfield.$el.attr('class', 'form-control userInput');
        this.keywordfield.$el.attr('id', 'search');
        this.keywordfield.$el.on('keyup', this.KeywordFieldAction.bind(this));
        this.labelForKeyword = $('<label for="search" class="label">ENTER A SEARCH KEYWORD</label>');

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('SUBMIT');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.labelForKeyword);
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
        Application.userConfig.input = key;

        Application._vent.trigger('controlpanel/parse');

    },
    parseKey: function(keyword) {

        keyword = keyword.trim().replace(/ /g, ',');
        return keyword;

    },
    destroy: function() {
        this.keywordfield.destroy();
        this.submitbtn.destroy();
        this.labelForKeyword.remove();
    }

});
