var Application = Application || {};

Application.SpreadSheetRootGlobeView = Application.RootGlobeView.extend({
  initialize: function(config) {
    Application.RootGlobeView.prototype.initialize.call(this, config);
  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  },
  createCollection: function(config) {

      return new Application.SpreadSheetCollection(config);
  },
  createGlobeView: function(config) {

      return new Application.SpreadSheetGlobeView(config);
  }
});

