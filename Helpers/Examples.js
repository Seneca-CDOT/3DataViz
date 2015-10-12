var Application = Application || {};

Application.Examples = {

  init: function() {

    var _this = this;

    Application.userConfig.model = 'json';

    return this;

  },
  destroy: function() {

  },
  immigration: {

    init: function() {

      Application._vent.on('data/ready', this.callTimeline, this);

      Application.attrsMap = {date: "time", latitude: "latitude", longitude: "longitude"};
      Application.userConfig.template = 'dynamic';
      Application._vent.trigger('controlpanel/parse'); // create collection

    },
    destroy: function() {
      Application._vent.unbind('data/ready', this.callTimeline);

    },
    callTimeline: function() {

      Application._vent.trigger('timeline/on');

    },

  }

}
