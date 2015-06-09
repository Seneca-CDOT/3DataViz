var Application = Application || {};

Application.SpreadSheetRootGlobeView = Application.RootGlobeView.extend({
  initialize: function(config) {
    console.log("testsssss");
    Application.RootGlobeView.prototype.initialize.call(this, config);

    // var obj = {};
    // obj._vent = this._vent;
    // obj.collection = new Application.SpreadSheetCollection(obj._vent);
    // this.globeView = new Application.SpreadSheetGlobeView(obj);
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

