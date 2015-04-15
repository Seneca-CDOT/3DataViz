var Application = Application || {};

Application.StaticTwitterRootGlobeView = Application.RootGlobeView.extend({
  initialize: function() {

    Application.RootGlobeView.prototype.initialize.call(this);
    
    var obj = {};
    obj.collection = new Application.StaticTwitterCountriesCollection();
    this.globeView = new Application.StaticTwitterGlobeView(obj);

    // TODO: Dima
    // this.controlPanel = new Application.StaticTwitterControlPanel();
  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  }
});

