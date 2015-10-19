Application.ControlPanelRootView = Backbone.View.extend({
  tagName: 'div',
  id: 'panel',
  initialize: function() {

    this.visualizationsView = null;
    this.timelineShown = false; // reflects the state of timeline button

    this.dataSourcesView = new Application.DataSourcesView();
    this.matcher = new Application.Matcher();


    Application._vent.on('data/parsed', this.addTemplatesView, this);

    Application._vent.on('matcher/on', this.destroyViews, this);
    Application._vent.on('controlpanel/input/changed', this.destroyViews, this);
    Application._vent.on('controlpanel/subview/model', this.destroyViews, this);
    Application._vent.on('controlpanel/subview/remove', this.destroyViews, this);
    Application._vent.on('controlpanel/menu/clear', this.clearDataSourceMenu, this);

    Application._vent.on('filters/on', this.addFiltersView, this);
    Application._vent.on('controlpanel/subview/model', this.changeLocation, this);
    //Application._vent.on('matcher/submit', this.addFiltersView, this);
    Application._vent.on('timeline/ready', this.addTimelineView, this);
    Application._vent.on('matcher/submit', this.addCameraSwitcherView, this);

    this.helpButton = new Application.Help();
    this.helpButton.$el.attr('id', 'helpButton');

    this.feedback = new Application.FeedBack();
    this.feedback.$el.attr('id', 'feedbackButton');

    this.$el.append(this.helpButton.render().$el);
    this.$el.append(this.feedback.render().$el);

  },
  render: function() {
    this.$el.append(this.dataSourcesView.render().$el);
    this.$el.append(this.matcher.render().$el);

    return this;
  },
  changeLocation: function() {
    window.location = '#view';
  },
  addTimelineView: function(dates) {

    if (this.timeline) this.timeline.destroy();
    this.addTimelineButton();
    this.timeline = new Application.Timeline(dates);
    this.$el.append(this.timeline.$el);
    this.timeline.update();
  },
  addTimelineButton: function() {

      if (this.timelineButton) this.timelineContainer.remove();

      this.timelineButton = new Application.Button();
      this.timelineButton.$el.text('TIMELINE');
      this.timelineButton.$el.on('mousedown', this.timelineButtonAction.bind(this));

      this.timelineContainer = $('<div class="configList"></div>');
      this.timelineContainer.append(this.timelineButton.render().$el);
      this.$el.append(this.timelineContainer);

  },
  timelineButtonAction: function() {

    if (this.timeline) {

      if (!this.timelineShown) {
        this.timeline.$el.show();
        Application._vent.trigger('timeline/on');

      } else {
        this.timeline.$el.hide();
        Application._vent.trigger('data/ready');
      }
      this.timelineShown = !this.timelineShown;
    } else {
      Application._vent.trigger('timeline/on');
      this.timelineShown = true;
    }
  },
  addFiltersView: function() {

    if (this.filtersView) this.filtersView.destroy();

    //if (!Application.attrsMap['category']) return;

    this.filtersView = new Application.FiltersView();
    this.$el.append(this.filtersView.render().$el);
    //this.filterPanel.$el.hide();

  },
  addCameraSwitcherView: function() {

    // console.log(this.cameraSwitcherView);

    if (this.cameraSwitcherView){
      this.cameraSwitcherView.destroy();
    }

    this.cameraSwitcherView = new Application.CameraSwitcherView();
    this.$el.append(this.cameraSwitcherView.render().$el);
    this.cameraSwitcherView.$el.hide();
  },
  addDataSourcesView: function() {
    if (this.dataSourcesView) this.dataSourcesView.destroy();
    this.dataSourcesView = new Application.DataSourcesView();
  },
  addTemplatesView: function() {

    var viewConfig = this.getTemplatesMap();

    if (this.visualizationsView) this.visualizationsView.destroy();
    this.visualizationsView = new Application.VisualizationsView(viewConfig);
    this.$el.append(this.visualizationsView.render().$el);

  },
  getTemplatesMap: function() {

    var config = {};
    var list = Application.models[Application.userConfig.model].templates;
    var map = {};

    $.each(list, function(i, internalName) {

      map[internalName] = Application.templates.map[internalName];

    });
    config.name = Application.templates.name;
    config.map = map;

    return config;
  },
  destroyViews: function() {
    this.destroyTemplatesView();
    this.destroyCategoriesView();
    this.destroyFilters();
    this.destroyTimeline();
    this.destroyCameraSwitch();
  },
  destroyDataSourceSubView: function() {

    if (this.dataSourcesView.subview)  this.dataSourcesView.subview.destroy();
  },
  destroyCameraSwitch: function() {
    if (this.cameraSwitcherView) {
      this.cameraSwitcherView.destroy();
      this.cameraSwitcherView = null;
    }
  },
  destroyFilters: function() {
    if (this.filtersView) {
      this.filtersView.destroy();
      this.filtersView = null;
    }
  },
  destroyTimeline: function() {
    if (this.timeline) {
      this.timeline.destroy();
      this.timeline = null;
    }

    if (this.timelineButton) {
      this.timelineButton.destroy();
      this.timelineButton = null;
      this.timelineContainer.remove();
      this.timelineContainer = null;
    }

    Application.userConfig.timelineAvailable = false;
  },
  destroyCategoriesView: function() {

    if (this.categoriesView) {
      this.categoriesView.destroy();
      this.categoriesView = null;
    }

  },
  destroyTemplatesView: function() {

    if (this.visualizationsView) {

      this.visualizationsView.destroy();
      this.visualizationsView = null;
    }

  },
  clearDataSourceMenu: function() {

    if (this.dataSourcesView != null) {
      this.dataSourcesView.clear();
    }

  },
  reset: function() {
    Application._vent.on('data/parsed', this.addTemplatesView, this);
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

Application.NotificationsCenter = Backbone.View.extend({
  tagName: 'div',
  id: 'notificationsBox',
  initialize: function() {
    Application._vent.on('controlpanel/message/on', this.showMessage, this);
    Application._vent.on('controlpanel/message/off', this.removeMessage, this);
    // Application._vent.on('data/ready', this.removeMessage, this);
    this.$el.hide();
  },
  render: function() {

    return this;
  },
  showMessage: function(message) {
    // console.log("showMessage", message);
    this.$el.fadeIn();
    this.$el.empty();
    this.$el.append('<div class="notification">' + message + '</div>');
  },
  removeMessage: function() {
    this.$el.empty();
    this.$el.fadeOut();
  },
  destroy: function() {
    Application._vent.unbind('controlpanel/message/on');
    Application._vent.unbind('controlpanel/message/off');
  }
});

Application.VizInfoCenter = Backbone.View.extend({
  tagName: 'div',
  id: 'vizInfoCenter',
  initialize: function() {
    Application._vent.on('vizinfocenter/message/on', this.showMessage, this);
    Application._vent.on('vizinfocenter/message/off', this.removeMessage, this);
    // Application._vent.on('data/ready', this.removeMessage, this);
    this.$el.hide();
  },
  render: function() {

    return this;
  },
  showMessage: function(message) {
    if(!this.$el.is(":visible")){
      this.$el.fadeIn();
      this.$el.empty();
      this.$el.append(message);
    }else{
      this.$el.html(message);
    }
  },
  removeMessage: function() {
    this.$el.empty();
    this.$el.hide();
  },
  destroy: function() {

    Application._vent.unbind('vizinfocenter/message/on');
    Application._vent.unbind('vizinfocenter/message/off');
  }
});

Application.VizTitleCenter = Backbone.View.extend({
  tagName: 'div',
  id: 'titleBox',
  initialize: function() {
    Application._vent.on('title/message/on', this.showMessage, this);
    this.$el.hide();
  },
  render: function() {
    return this;
  },
  showMessage: function(message) {
    this.$el.fadeIn();
    this.$el.empty();
    this.$el.append('<p>' + message + '</p>');
  },
  removeMessage: function() {
    this.$el.empty();
    this.$el.fadeOut();
  },
  destroy: function() {
    Application._vent.unbind('title/message/on');
  }
});

Application.DataSourcesView = Backbone.View.extend({
  tagName: 'div',
  className: 'configList',
  initialize: function() {

    this.subview = null;
    //this.templateView = null;

    this.dataSourcesList = new Application.DropDownList(Application.models);
    this.dataSourcesList.$el.attr('id', 'dataSourcesList');
    this.$el.append('<label for="dataSourcesList" class="label">CHOOSE A DATA SOURCE</label>');

    Application._vent.on('controlpanel/subview/model', this.addSubView, this);
    Application._vent.on('controlpanel/subview/remove', this.removeSubView, this);

  },
  render: function() {
    this.$el.append(this.dataSourcesList.render().$el);
    // this.$el.append(this.visualizationList.render().$el);
    // this.$el.append(this.templatesList.render().$el);
    return this;
  },
  clear: function() {

    this.dataSourcesList.clear();
  },
  destroy: function() {

    Application._vent.unbind('controlpanel/subview/model');
    Application._vent.unbind('controlpanel/subview/remove');
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
  removeSubView: function() {

    if (this.subview) {
      this.subview.destroy();
      this.subview = null;
    }
  },
  getSubView: function() {

    switch (Application.userConfig.model) {

      case 'twitterDB':
      this.subview = new Application.DynamicTwitterDBControlPanel();
      break;
      case 'twitterLive':
      this.subview = new Application.DynamicTwitterLiveControlPanel();
      break;
      case 'csv':
      this.subview = new Application.CSVControlPanel();
      break;
      case 'box':
      this.subview = new Application.BoxControlPanel();
      break;
      case 'spreadSheet':
      this.subview = new Application.SpreadSheetControlPanel();
      break;
      case 'googleTrends':
      this.subview = new Application.GoogleTrendsControlPanel();
      break;
      case 'json':
      this.subview = new Application.JSONControlPanel();
      break;
    }

    return this.subview;

  },

});

Application.VisualizationsView = Backbone.View.extend({
  tagName: 'div',
  className: 'configList',
  initialize: function(config) {

    this.subview = null;
    this.visualizebtn = null;
    this.config = config;
    Application._vent.on('controlpanel/subview/template', this.addThumbnail, this);
    this.getSubView();
  },
  render: function() {

    return this;
  },
  destroy: function() {

    this.remove();
    this.config = null;
    this.visualizationList = null;
    this.subview.destroy();
    this.subview = null;
    this.filterButton.destroy();
    this.filterButton = null;

  },
  addSubView: function() {

    if (this.subview) {
      if (this.labelForTemplates) this.labelForTemplates.remove();
      this.subview.destroy();
    }

    if (this.visualizebtn) this.visualizebtn.destroy(); // to rework
    this.subview = this.getSubView();
    Application._vent.unbind('controlpanel/subview/template', this.addThumbnail);
  },

  getSubView: function() {
    var that = this;

    if (Application.models[Application.userConfig.model].attributes == false) {
      this.subview = new Application.DropDownList(this.config);
      this.subview.$el.attr('id', 'templatesList');
      this.labelForTemplates = $('<label for="templatesList" class="label">CHOOSE A TEMPLATE</label>');
      this.$el.append(this.labelForTemplates);

      this.$el.append(this.subview.render().$el);

      this.visualizebtn = new Application.Button(this.config.map); // to do submit button in elements

      this.visualizebtn.$el.text('VISUALIZE');
      this.visualizebtn.$el.on('mousedown', this.submitAction.bind(this));
      this.$el.append(this.visualizebtn.render().$el);
    }

    return this.subview;

  },
  submitAction: function(e) {
    Application._vent.trigger('visualize');
  },
  addThumbnail: function(name) {
    if (this.picDiv) this.picDiv.remove();
    this.picDiv = $('<div id="pic"></div>');
    this.pic = $('<img src="Assets/images/templates/' + name + '.png">');
    this.picDiv.append(this.pic);
    this.$el.append(this.picDiv);
  },


});


Application.ButtonsView = Backbone.View.extend({
  id: 'buttons',
  initialize: function() {

  },
  render: function() {

    return this;
  },
  destroy: function() {

    this.remove();
    this.$el.empty();
  }
});

Application.CSVControlPanel = Application.ButtonsView.extend({

  initialize: function() {

    Application.ButtonsView.prototype.initialize.call(this);
    var that = this;
    this.fileUpload = new Application.FileUpload('csv');
    this.fileUpload.$el.on('change', function(){
      var ex = Application.Helper.getFileExtention( that.fileUpload.getFile().name );
      switch(ex){
        case 'csv':
        that.submitbtn.$el.removeAttr('disabled');
        that.fileUpload.changeErrMsg('');
        break;
        default:
        that.submitbtn.$el.attr('disabled','disabled');
        that.fileUpload.changeErrMsg('Please choose CSV file.');
        break;
      }
    });

    this.submitbtn = new Application.Button();
    this.submitbtn.$el.text('SUBMIT');
    this.submitbtn.$el.attr('disabled','disabled');
    this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

  },
  render: function() {
    Application.ButtonsView.prototype.render.call(this);
    this.$el.append(this.fileUpload.render().$el);
    this.$el.append(this.submitbtn.render().$el);
    return this;
  },
  submitAction: function() {

    var files = this.fileUpload.getFile();
    Application.userConfig.files = files;
    Application._vent.trigger('controlpanel/parse');

  },
  destroy: function() {
    this.submitbtn.destroy();
    this.fileUpload.destroy();
  }
});


Application.BoxControlPanel = Application.ButtonsView.extend({

  initialize: function() {

    Application.ButtonsView.prototype.initialize.call(this);
    var that = this;
    this.boxExplorer = new Application.BoxExplorer();
    this.boxExplorer.on('success', function(){
      var ex = Application.Helper.getFileExtention( that.boxExplorer.getFileInfo().name );
      switch(ex){
        case 'csv':
        that.submitbtn.$el.removeAttr('disabled');
        that.boxExplorer.changeErrMsg('');
        break;
        default:
        that.submitbtn.$el.attr('disabled','disabled');
        that.boxExplorer.changeErrMsg('Please choose CSV file.');
        break;
      }
    })

    this.submitbtn = new Application.Button();
    this.submitbtn.$el.text('SUBMIT');
    this.submitbtn.$el.attr('disabled','disabled');
    this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

  },
  render: function() {
    Application.ButtonsView.prototype.render.call(this);
    this.$el.append(this.boxExplorer.render().$el);
    this.$el.append(this.submitbtn.render().$el);

    return this;
  },
  submitAction: function() {

    Application.userConfig.fileInfo = this.boxExplorer.getFileInfo();
    Application._vent.trigger('controlpanel/parse');

  },
  destroy: function() {
    this.submitbtn.destroy();
    this.boxExplorer.destroy();
  }
});


Application.DynamicTwitterLiveControlPanel = Application.ButtonsView.extend({

  initialize: function() {
    Application.ButtonsView.prototype.initialize.call(this);

    this.search = new Application.InputField();
    this.search.$el.attr('class', 'form-control userInput');
    this.search.$el.attr('id', 'search');
    this.search.$el.on('keyup', this.searchFieldAction.bind(this));
    this.labelForSearch = $('<label for="search" class="label">ENTER A SEARCH KEYWORD</label>');

    this.submitbtn = new Application.Button();
    this.submitbtn.$el.text('SUBMIT');
    this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

  },
  render: function() {
    Application.ButtonsView.prototype.render.call(this);
    this.$el.append(this.labelForSearch);
    this.$el.append(this.search.render().$el);
    this.$el.append(this.submitbtn.render().$el);
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
    this.labelForSearch = null;

  }
});

Application.DynamicTwitterDBControlPanel = Application.ButtonsView.extend({

  initialize: function() {
    Application.ButtonsView.prototype.initialize.call(this);

    this.requestTimeFrom();
    this.requestTimeTo();

    this.timeFrom = new Application.InputField();
    this.timeFrom.$el.attr('class', 'form-control userInput');
    this.timeFrom.$el.attr('id', 'timeFrom');
    this.timeFrom.$el.attr('placeholder', 'Loading...');
    this.timeFrom.$el.on('keyup', this.timeFieldAction.bind(this));
    this.labelForTimeFrom = $('<label for="timeFrom" class="label">ENTER INITIAL TIME</label>');

    this.timeTo = new Application.InputField();
    this.timeTo.$el.attr('class', 'form-control userInput');
    this.timeTo.$el.attr('id', 'timeTo');
    this.timeTo.$el.attr('placeholder', 'Loading...');
    this.timeTo.$el.on('keyup', this.timeFieldAction.bind(this));
    this.labelForTimeTo = $('<label for="timeTo" class="label">ENTER FINAL TIME</label>');

    this.search = new Application.InputField();
    this.search.$el.attr('class', 'form-control userInput');
    this.search.$el.on('keyup', this.searchFieldAction.bind(this));
    this.labelForSearch = $('<label for="search" class="label">ENTER A SEARCH KEYWORD</label>');

    this.submitbtn = new Application.Button();
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

    $.get(path + 'twitterDB/apple/timefrom').done(function(data) {
      // console.log(data[0].timestamp_ms);
      var datetime = that.convertStampToDateTime(data[0].timestamp_ms);
      that.timeFrom.$el.val(datetime);
    });
  },
  requestTimeTo: function() {
    var that = this;
    var path = 'http://threedataviz.herokuapp.com/';

    $.get(path + 'twitterDB/apple/timeto').done(function(data) {
      // console.log(data[0].timestamp_ms);
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
    this.submitbtn = null;
    this.search.destroy();
    this.search = null;
    this.labelForSearch.remove();
    this.labelForSearch = null;
    this.timeFrom.destroy();
    this.timeFrom = null;
    this.labelForTimeFrom.remove();
    this.labelForTimeFrom = null;
    this.timeTo.destroy();
    this.timeTo = null;
    this.labelForTimeTo.remove();
    this.labelForTimeTo = null;

  }
});

Application.SpreadSheetControlPanel = Application.ButtonsView.extend({

  initialize: function() {
    Application.ButtonsView.prototype.initialize.call(this);

    this.urlfield = new Application.InputField();
    this.urlfield.$el.attr('class', 'form-control userInput');
    this.urlfield.$el.attr('id', 'key');
    // this.urlfield.$el.val("13aV2htkF_dYz4uU76mJMhFfDBxrCkD1jJI5ktw4lBLg");
    // this.urlfield.$el.val("1HFYTBC2iKabiidtP2U148PKvMW5tRUvxTAzoJ7w3vNo");
    this.urlfield.$el.val("1GAYmPSBgK0yuluRcIWjyVVWnh41L4fDG00fJbHVZnFk");
    this.urlfield.$el.on('mousedown', this.urlFieldAction.bind(this));
    this.labelForKey = $('<label for="key" class="label">ENTER A KEY</label>');

    this.submitbtn = new Application.Button();
    this.submitbtn.$el.text('SUBMIT');
    this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

  },
  render: function() {
    Application.ButtonsView.prototype.render.call(this);
    this.$el.append(this.labelForKey);
    this.$el.append(this.urlfield.render().$el);
    this.$el.append(this.submitbtn.render().$el);
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
    this.submitbtn = null;
    this.urlfield.destroy();
    this.urlfield = null;
    this.labelForKey.remove();
    this.labelForKey = null;
  }

});

Application.GoogleTrendsControlPanel = Application.ButtonsView.extend({

  initialize: function() {
    Application.ButtonsView.prototype.initialize.call(this);

    this.keywordfield = new Application.InputField();
    this.keywordfield.$el.attr('class', 'form-control userInput');
    this.keywordfield.$el.attr('id', 'search');
    this.keywordfield.$el.on('keyup', this.KeywordFieldAction.bind(this));
    this.labelForKeyword = $('<label for="search" class="label">ENTER A SEARCH KEYWORD</label>');

    this.submitbtn = new Application.Button();
    this.submitbtn.$el.text('SUBMIT');
    this.submitbtn.$el.attr('disabled','disabled');
    this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

  },
  render: function() {
    Application.ButtonsView.prototype.render.call(this);
    this.$el.append(this.labelForKeyword);
    this.$el.append(this.keywordfield.render().$el);
    this.$el.append(this.submitbtn.render().$el);
    return this;
  },
  KeywordFieldAction: function(e) {

    if(this.keywordfield.$el.val() != ''){
      this.submitbtn.$el.removeAttr('disabled');
    }else{
      this.submitbtn.$el.attr('disabled','disabled');
    }

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

    // keyword = keyword.trim().replace(/ /g, ',');
    keyword = keyword.trim();
    return keyword;

  },
  destroy: function() {
    this.keywordfield.destroy();
    this.keywordfield.$el.unbind();
    this.keywordfield = null;
    this.submitbtn.destroy();
    this.submitbtn.$el.unbind();
    this.submitbtn = null;
    this.labelForKeyword.remove();
    this.labelForKeyword = null;
  }

});

Application.JSONControlPanel = Application.ButtonsView.extend({

  initialize: function() {

    Application.ButtonsView.prototype.initialize.call(this);
    var that = this;
    this.fileUpload = new Application.FileUpload('json');
    this.fileUpload.$el.on('change', function(){
      var ex = Application.Helper.getFileExtention( that.fileUpload.getFile().name );
      switch(ex){
        case 'json':
        that.submitbtn.$el.removeAttr('disabled');
        that.fileUpload.changeErrMsg('');
        break;
        default:
        that.submitbtn.$el.attr('disabled','disabled');
        that.fileUpload.changeErrMsg('Please choose a JSON file.');
        break;
      }
    });

    this.submitbtn = new Application.Button();
    this.submitbtn.$el.text('SUBMIT');
    this.submitbtn.$el.attr('disabled','disabled');
    this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

  },
  render: function() {
    Application.ButtonsView.prototype.render.call(this);
    this.$el.append(this.fileUpload.render().$el);
    this.$el.append(this.submitbtn.render().$el);
    return this;
  },
  submitAction: function() {

    var files = this.fileUpload.getFile();
    Application.userConfig.files = files;
    Application._vent.trigger('controlpanel/parse');

  },
  destroy: function() {
    this.submitbtn.$el.unbind();
    this.submitbtn.destroy();
    this.fileUpload.$el.unbind();
    this.fileUpload.destroy();
  }
});
