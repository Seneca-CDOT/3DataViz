var Application = Application || {};

Application.CSVRecord = Application.GeoDataRecord.extend({

    defaults: _.extend({}, Application.GeoDataRecord.prototype.defaults, {

    }),
    initialize: function() {
        Application.GeoDataRecord.prototype.initialize.call(this);
    }

});

Application.CSVCollection = Application.BaseGlobeCollection.extend({
    model: Application.CSVRecord,
    initialize: function(config) {

        this.file = Application.userConfig.files;
        Application.BaseGlobeCollection.prototype.initialize.call(this);

    },
    preParse: function() {

        // console.log("Attempt to load from BOX API");

        // var xhr = Application.Helper.createCORSRequest('GET', "https://api.box.com/2.0/files/32509103967/content");
        // xhr.setRequestHeader('Authorization', 'Bearer 0xp2J2XZq9B0tyirx5UBZkmWEe7ZHAmw');
        // if (!xhr) {
        //   throw new Error('CORS not supported');
        // }else{
        //     console.log("No problem");
        // }
        // // Response handlers.
        // xhr.onload = function() {
        //     var text = xhr.responseText;
        //     var title = getTitle(text);
        //     alert('Response from CORS request to ' + url + ': ' + title);
        // };

        // xhr.onerror = function() {
        //     alert('Woops, there was an error making the request.');
        // };

        // xhr.send();
        // 

          // headers: {
          //   // Set any custom headers here.
          //   // If you set any non-simple headers, your server must include these
          //   // headers in the 'Access-Control-Allow-Headers' response header.
          // },

        // $.ajax({
        //   url: "https://app.box.com/api/oauth2/authorize",
        //   dataType: 'jsonp',
        //   success: function(data, status) {
        //     return console.log("The returned data", data);
        //   },
        //   error: function(){
        //     console.log("error");
        //   },
        //   beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer EupslPFuXP4BegstHZ2JrZ4eksVeVT05'); } 
        // });
        
        // $.ajax({
        //   url: "https://api.box.com/2.0/files/32509103967/content",
        //   type: 'GET',
        //   contentType: 'text/plain',
        //   xhrFields: {
        //     withCredentials: false
        //   },
        //   success: function(data, status) {
        //     return console.log("The returned data", data);
        //   },
        //   error: function(msg){
        //     console.log(msg);
        //   },
        //   beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer 0xp2J2XZq9B0tyirx5UBZkmWEe7ZHAmw'); } 
        // });

        // var that = this;
        // Papa.parse(this.file, {
        //     preview: 1,
        //     header: true,
        //     complete: function(response){
        //         console.log("Preparse:", response.data);
        //         Application._vent.trigger('data/parsed', that.getViewConfigs(response.data));
        //     }
        // });

    },
    parse: function(file) {

        // console.log(response);
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            dataType: "csv"
        };

        pModule.processData(this.file, options, function(response){
            console.log("parse:",response);
            that.transform(response.data); 
        });

    },
    transform: function(data){
        var pModule = Application.DataProcessor.ProcessorModule;
        var that = this;
        var options = {
            visualizationType: Application.userConfig.vizLayer
        }

        pModule.transformData(data, options, function(response){
            console.log("transform:",response);
            that.models = response;
            Application._vent.trigger('data/ready'); 
        });
    },
    fetch: function() {
        // this.parse();

        console.log("Attempt to load from BOX API");

        $.ajax({
          url: "https://api.box.com/2.0/files/32509103967/content",
          dataType: 'jsonp',
          data: {
            alt: 'json-in-script'
          },
          success: function(data, status) {
            return console.log("The returned data", data);
          },
          error: function(){
            console.log("error");
          },
          beforeSend: function(xhr, settings) { xhr.setRequestHeader('Authorization','Bearer EupslPFuXP4BegstHZ2JrZ4eksVeVT05'); } 
        });


    },
    destroy: function() {
       // console.log("Destroy SpreadSheetCollection");
        for (var i = 0; i < this.models.length; i++) {
            this.models[i] = null;
        }
    },
    getViewConfigs: function(data) {

        var defaults = {
            vizType: {
                name: 'vizType',
                list: ['geometry', 'texture']
            },
            vizLayer: {
                name: 'vizLayer',
                list: ['points', 'countries', 'graph']
            }
        }
        return Application.BaseGlobeCollection.prototype.getViewConfigs.call(this, data, defaults);

    }

});
