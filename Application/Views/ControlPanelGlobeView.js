Application.ControlPanelRootView = Backbone.View.extend({
    tagName: 'div',
    id: 'panel',
    initialize: function() {

        this.addDataSourcesView();
        Application._vent.on('data/parsed', this.addVisualizationsView.bind(this));


    },
    render: function() {
        this.$el.append(this.dataSourcesView.render().$el);
        // this.$el.append(this.visualizationsView.render().$el);
        return this;
    },
    destroy: function() {},
    addDataSourcesView: function() {

        this.dataSourcesView = new Application.DataSourcesView();
    },
    addVisualizationsView: function(viewConfig) {

        this.visualizationsView = new Application.VisualizationsView(viewConfig);
        this.$el.append(this.visualizationsView.render().$el);

        Application._vent.unbind('data/parsed');
    }
});

Application.DataSourcesView = Backbone.View.extend({
    tagName: 'div',
    className: 'configList',
    initialize: function() {

        this.subview = null;
        //this.templateView = null;

        this.viewConfig = {
            name: 'dataSource',
            list: ['twitter', 'csv', 'spreadSheet', 'googleTrends']
        };
        this.dataSourcesList = new Application.DropDownList(this.viewConfig);
        this.dataSourcesList.$el.attr('id', 'dataSourcesList');

        Application._vent.on('controlpanelsubview/dataSource', this.addSubView.bind(this));
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

            case 'twitter':
                this.subview = new Application.DynamicTwitterControlPanel(subViewConfig);
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

        Application._vent.on('controlpanelsubview/vizType', this.addSubView.bind(this));


    },
    render: function() {

        this.$el.append(this.visualizationList.render().$el);


        return this;
    },
    destroy: function() {

        this.remove();
    },
    addSubView: function() {

        if (this.subview) this.subview.destroy();
        if (this.visualizebtn) this.visualizebtn.destroy(); // to rework

        this.subview = this.getSubView();


    },
    getSubView: function() {

        this.subview = new Application.DropDownList(this.viewConfigs.vizLayer);
        this.subview.$el.attr('id', 'templatesList');
        this.$el.append(this.subview.render().$el);

        this.visualizebtn = new Application.Button(this.viewConfigs.vizLayer); // to do submit button in elements
        this.visualizebtn.$el.text('visualize');
        this.visualizebtn.$el.on('mousedown', this.submitAction.bind(this));
        this.$el.append(this.visualizebtn.render().$el);

        return this.subview;

    },
    submitAction: function(e) {
      console.log(Application.userConfig);
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

        this.remove();
        //this.$el.empty();
    }
});

Application.CSVControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {

        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('submit');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
        this.$el.append(this.submitbtn.render().$el);
        return this;
    },
    submitAction: function() {

        Application._vent.trigger('controlpanel/parse');
    }
});

Application.DynamicTwitterControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {
        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.search = new Application.InputField(viewConfig);
        this.search.$el.attr('id', 'userInput');
        this.search.$el.attr('class', 'form-control');
        this.search.$el.attr('placeholder', 'Enter the Keyword');
        this.search.$el.on('keyup', this.searchFieldAction.bind(this));

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('submit');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
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

    }
});

Application.SpreadSheetControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {
        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.urlfield = new Application.InputField(viewConfig);
        this.urlfield.$el.attr('id', 'userInput');
        this.urlfield.$el.attr('class', 'form-control');
        this.urlfield.$el.attr('placeholder', 'Submit the URL');
        this.urlfield.$el.on('mousedown', this.urlFieldAction.bind(this));

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('submit');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        // this.resetbtn = new Application.Button(config);
        // this.resetbtn.$el.attr('id', 'reset');
        // this.resetbtn.$el.attr('class', 'btn btn-danger');
        // this.resetbtn.$el[0].innerHTML = 'reset';
        // this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ButtonsView.prototype.render.call(this);
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

        if(url.match(/^http:\/\/|^https:\/\//g)){

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

        }else{
            key = url
        }

        return key;

    }

});

Application.GoogleTrendsControlPanel = Application.ButtonsView.extend({

    initialize: function(viewConfig) {
        Application.ButtonsView.prototype.initialize.call(this, viewConfig);

        this.keywordfield = new Application.InputField(viewConfig);
        this.keywordfield.$el.attr('id', 'userInput');
        this.keywordfield.$el.attr('class', 'form-control');
        this.keywordfield.$el.attr('placeholder', 'Enter the keyword');
        this.keywordfield.$el.on('keyup', this.KeywordFieldAction.bind(this));

        this.submitbtn = new Application.Button(viewConfig);
        this.submitbtn.$el.text('submit');
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        // this.resetbtn = new Application.Button(config);
        // this.resetbtn.$el.attr('id', 'reset');
        // this.resetbtn.$el.attr('class', 'btn btn-danger');
        // this.resetbtn.$el[0].innerHTML = 'reset';
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
        Application.userConfig.input = key;

        Application._vent.trigger('controlpanel/parse');

    },
    parseKey: function(keyword) {

        keyword = keyword.trim().replace(/ /g, ',');
        return keyword;

    }

});