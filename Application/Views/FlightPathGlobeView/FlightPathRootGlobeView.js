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
    obj.collection.push(new Application.AirportsCollection());
    obj.collection.push(new Application.AirportRoutesCollection());
    this.globeView = new Application.FlightPathGlobeView(obj);

    this.globeView.decorators.push(new Application.GeometryGlobeDecorator());
  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  }
});

