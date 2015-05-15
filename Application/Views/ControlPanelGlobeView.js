Application.ControlPanelGlobeView = Backbone.View.extend({
    tagName: 'div',
    id: 'rightcolumn',
    initialize: function(_vent) {

        this._vent = _vent;

        this.dataSourcesList = new Application.DropDownList({ name: 'datasource', event: _vent });
        this.dataSourcesList.$el.attr('id', 'datasourcesList');
        this.dataSourcesList.$el.attr('class', 'form-control');
        this.datalist = ['twitter','csv','spreadsheet','trends'];

        this.visualizationList = new Application.DropDownList({ name: 'visualization', event: _vent });
        this.visualizationList.$el.attr('id', 'visualizationList');
        this.visualizationList.$el.attr('class', 'form-control');
        this.vislist = ['geometry','texture'];

        this.templatesList = new Application.DropDownList({ name: 'datalayer', event: _vent });
        this.templatesList.$el.attr('id', 'templatesList');
        this.templatesList.$el.attr('class', 'form-control');
        //this.temlist = ['paths','points','countries','dynamic points'];
        this.temlist = ['spreadSheet','staticTwitter','flightPath','dynamic','googleTrends'];

    },
    render: function() {
        this.$el.append(this.dataSourcesList.render(this.datalist).$el);
        this.$el.append(this.visualizationList.render(this.vislist).$el);
        this.$el.append(this.templatesList.render(this.temlist).$el);
        return this;
    },
    destroy: function() {

        this.remove();
        this.unbind();
        delete this.$el;
        delete this.el;
    }

});


Application.StaticTwitterControlPanel = Application.ControlPanelGlobeView.extend({

    initialize: function() {
        Application.ControlPanelGlobeView.prototype.initialize.call(this);
        this.search = new Application.SearchField();
        this.tweetsbtn = new Application.TweetsButton();
        this.resetbtn = new Application.ResetButton();
    },
    render: function() {
        Application.ControlPanelGlobeView.prototype.render.call(this);
        this.$el.append(this.search.render().$el);
        this.$el.append(this.tweetsbtn.render().$el);
        this.$el.append(this.resetbtn.render().$el);
        return this;
    }

});

Application.SpreadSheetControlPanel = Application.ControlPanelGlobeView.extend({

    initialize: function() {
        Application.ControlPanelGlobeView.prototype.initialize.call(this);

        this.urlfield = new Application.InputField();
        this.urlfield.$el.attr('id', 'url');
        this.urlfield.$el.attr('class', 'form-control');
        this.urlfield.$el.attr('placeholder', 'Submit the URL');
        this.urlfield.$el.on('mousedown', this.urlFieldAction.bind(this));

        this.submitbtn = new Application.Button();
        this.submitbtn.$el.attr('id', 'submit');
        this.submitbtn.$el.attr('class', 'btn btn-primary');
        this.submitbtn.$el[0].innerText = 'submit';
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        this.resetbtn = new Application.Button();
        this.resetbtn.$el.attr('id', 'reset');
        this.resetbtn.$el.attr('class', 'btn btn-danger');
        this.resetbtn.$el[0].innerText = 'reset';
        this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ControlPanelGlobeView.prototype.render.call(this);
        this.$el.append(this.urlfield.render().$el);
        this.$el.append(this.submitbtn.render().$el);
        this.$el.append(this.resetbtn.render().$el);
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

        this._vent.trigger('click/submit', key);

    },
    resetAction: function() {

        this.urlfield.$el.val('');
        this._vent.trigger('click/reset');

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

Application.GoogleTrendsControlPanel = Application.ControlPanelGlobeView.extend({

    initialize: function() {
        Application.ControlPanelGlobeView.prototype.initialize.call(this);

        this.datasourceslist = new Application.DataSourcesList();
        this.datasourceslist.$el.attr('id', 'datasourceslist');
        this.datasourceslist.$el.attr('class', 'form-control');

        this.keywordfield = new Application.InputField();
        this.keywordfield.$el.attr('id', 'url');
        this.keywordfield.$el.attr('class', 'form-control');
        this.keywordfield.$el.attr('placeholder', 'Enter the keyword');
        this.keywordfield.$el.on('keyup', this.KeywordFieldAction.bind(this));

        this.submitbtn = new Application.Button();
        this.submitbtn.$el.attr('id', 'submit');
        this.submitbtn.$el.attr('class', 'btn btn-primary');
        this.submitbtn.$el[0].innerText = 'submit';
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        this.resetbtn = new Application.Button();
        this.resetbtn.$el.attr('id', 'reset');
        this.resetbtn.$el.attr('class', 'btn btn-danger');
        this.resetbtn.$el[0].innerText = 'reset';
        this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ControlPanelGlobeView.prototype.render.call(this);
        this.$el.append(this.keywordfield.render().$el);
        this.$el.append(this.submitbtn.render().$el);
        this.$el.append(this.resetbtn.render().$el);
        this.$el.append(this.datasourceslist.render().$el);
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

        this._vent.trigger('click/submit', key);

    },
    resetAction: function() {

        this.keywordfield.$el.val('');
        this._vent.trigger('click/reset');

    },
    parseKey: function(keyword) {

        keyword = keyword.trim().replace(/ /g, ',');
        return keyword;

    }

});