var Application = Application || {};

Application.FlightPathRootGlobeView = Application.RootGlobeView.extend({
  initialize: function() {

    Application.RootGlobeView.prototype.initialize.call(this);
    
    // we need 2 collections:
    // - airports around the world
    // - routes
    // as amazing as it may sound, this works
    var obj = {};
    obj.collection = [];
    obj.collection[0] = new Application.AirportsCollection();
    obj.collection[1] = new Application.AirportRoutesCollection();
    this.globeView = new Application.FlightPathGlobeView(obj);

  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  }
});

