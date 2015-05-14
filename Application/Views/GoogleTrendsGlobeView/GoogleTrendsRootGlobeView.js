var Application = Application || {};

Application.GoogleTrendsRootGlobeView = Application.RootGlobeView.extend({
  initialize: function() {

    Application.RootGlobeView.prototype.initialize.call(this);
    var obj = {};
    obj._vent = this._vent;
    obj.collection = new Application.GoogleTrendsCollection(obj._vent);
    this.globeView = new Application.GoogleTrendsGlobeView(obj);
  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  }
});

