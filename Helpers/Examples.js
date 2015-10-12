var Application = Application || {};

Application.Examples = {

  init: function() {

    var _this = this;
    Application.userConfig.model = 'json';

    var list = ['quakes'];

    var $samplesDiv = $('.sample.cf');
    $samplesDiv.prepend('<div class="heading">Choose an example<div/>')
    var $templist = $('<ul class=""></ul>');
    var $wrap = $('<div class="templateImgList"></div>')

    $.each(list, function(index, item) {
        $templist.append('<li><button class="imgBtn"><img src="Assets/images/examples/'+ item + '.png"><p class="templateTitle" id="' + index + '">'+item+'</p></button></li>');
    });
   $samplesDiv.append($wrap.append($templist));

   $('button.imgBtn', $samplesDiv).on('click', this.immigration.init.bind(this));

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
