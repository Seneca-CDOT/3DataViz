var Application = Application || {};

Application.SpreadSheetRootGlobeView = Application.RootGlobeView.extend({
  initialize: function() {

    Application.RootGlobeView.prototype.initialize.call(this);
    
    var obj = {};
    obj._vent = this._vent;
    obj.collection = new Application.SpreadSheetCollection(obj._vent);
    this.globeView = new Application.SpreadSheetGlobeView(obj);
  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  }
});

