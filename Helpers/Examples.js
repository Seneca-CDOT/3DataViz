var Application = Application || {};

Application.Examples = {

  init: function() {

    var _this = this;
    this.data = {};

    $.ajax({
           type: "GET",
           url: "SampleData/Location/earthquake.csv",
           dataType: "text",
           success: _this.onLoad,
           error: function(err) { throw err; }
        });

  //  this.fileUpload = new Application.FileUpload();

  },
    destroy: function() {

      this.fileUpload.destroy();
    },
    onLoad: function(data) {

      this.data = data;
      Application.userConfig.files = files;
      Application._vent.trigger('controlpanel/parse');
    },

immigration: {

  init: function() {


  },

}

}
