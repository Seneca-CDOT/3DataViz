var Application = Application || {};

Application.FlightPathRootGlobeView = Application.RootGlobeView.extend({

  initialize: function(config) {

    Application.RootGlobeView.prototype.initialize.call(this, config);
  },
  render: function(options) {

    Application.RootGlobeView.prototype.render.call(this);
    return this;
  },

  createCollection: function(config) {

      var collection = [];
      collection.push(new Application.AirportsCollection());
      collection.push(new Application.AirportRoutesCollection());

      return collection;
  },
  createGlobeView: function(config) {

      return new Application.FlightPathGlobeView(config);
  }
});

