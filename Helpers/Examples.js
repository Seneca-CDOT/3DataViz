var Application = Application || {};

Application.Examples = {

  init: function() {

    var _this = this;

    Application.userConfig.model = 'json';
// Application._vent.trigger('visualize'); // init globe


  },
  destroy: function() {

  },
  immigration: {

    init: function() {

  Application.attrsMap = {date: "time", latitude: "latitude", longitude: "longitude"};
     Application.userConfig.template = 'dynamic';
     Application._vent.trigger('controlpanel/parse'); // create collection


    },

  }

}
