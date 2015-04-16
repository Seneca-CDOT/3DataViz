var Application = Application || {};

Application.SpreadSheetRootGlobeView = Application.RootGlobeView.extend({
  initialize: function() {

    Application.RootGlobeView.prototype.initialize.call(this);
    
    this._vent = _.extend({}, Backbone.Events);
    var obj = {};
    obj._event = this._vent;
    obj.collection = new Application.SpreadSheetCollection();
    this.globeView = new Application.SpreadSheetGlobeView(obj);
  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  }
});

