var Application = Application || {};

Application.JSONRecord = Backbone.Model.extend({
    defaults: {
        timestamp: 0
    },
    initialize: function() {}
});

Application.JSONCollection = Application.BaseGlobeCollection.extend({
    model: Application.JSONRecord,
    initialize: function(config) {

        Application.BaseGlobeCollection.prototype.initialize.call(this);
        this.data = null;

    },
    parse: function() {

      var _this = this;

      $.ajax({
             type: "GET",
             url: "SampleData/Location/earthquake.json",
             dataType: "json",
             success: _this.onDataLoad.bind(_this),
             error: function(err) { throw err; }
          });

    },
    onDataLoad: function(response) {

      this.data = response;
      Application._vent.trigger('visualize'); // init globe

    },
    transform: function(){
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            visualizationType: Application.userConfig.template
        }

        pModule.transformData(this.data, options, function(response){
            // console.log("transform:",response);
            that.models = response;
            Application._vent.trigger('data/ready');
        });
    },
    fetch: function() {
        this.parse();
    },
    destroy: function() {
       Application.BaseGlobeCollection.prototype.destroy.call(this);
   },

});
