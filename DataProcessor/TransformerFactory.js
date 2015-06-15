var Application = Application || {};

Application.DataProcessor.TransformerFactory = (function() {

    var TransformerClass = Application.DataProcessor.PointsVisualTransformer;

    var publicMethods = {};
    publicMethods.createTransformer = function(options) {

        switch (options.transformerType) {

            case "countriesVisualTransformer":
                console.log("countriesVisualTransformer");
                TransformerClass = Application.DataProcessor.CountriesVisualTransformer;
                break;
            case "pointsVisualTransformer":
                console.log("pointsVisualTransformer");
                TransformerClass = Application.DataProcessor.PointsVisualTransformer;
                break;
            case "dynamicVisualTransformer":
                console.log("dynamicVisualTransformer");
                TransformerClass = Application.DataProcessor.DynamicVisualTransformer;
                break;
            case "graphVisualTransformer":
                console.log("graphVisualTransformer");
                TransformerClass = Application.DataProcessor.GraphTransformer;
                break;
        }
        // console.log(TransformerClass);
        return new TransformerClass(options);
    };

    return {

        createTransformer: publicMethods.createTransformer
    };
})();

// strategy

Application.DataProcessor.BaseTransformerStrategy = (function() {

    // private store
    var _ = {};
    var uid = 0;

    function BaseTransformerStrategy() {

        this.testPublicVariable = "test-public";

        _[this.id = uid++] = {};
        _[this.id].testPrivateVariable = "test-private";
    };
    // inherite the base interface if needed
    // Application.Helper.inherit(...)

    BaseTransformerStrategy.prototype.transform = function(data) {

        throw 'Please, define an abstract interface.';
    };

    // { *** for testing purposes
    BaseTransformerStrategy.prototype.testPublicFunction1 = function(data) {

        // calling private function from public
        privateMethods.testPrivateFunction1.call(this);
    };

    BaseTransformerStrategy.prototype.testPublicFunction2 = function(data) {

        // accessing public and private variables form public function
        console.log("From public function: " + this.testPublicVariable + "  " + _[this.id].testPrivateVariable);
    };

    // define private methods after prototype has been inhereted and defined

    // by doing this you have got an access to the public methods from private methods
    var privateMethods = Object.create(BaseTransformerStrategy.prototype);
    privateMethods.testPrivateFunction1 = function() {

        // calling public function from private
        privateMethods.testPublicFunction2.call(this);

        // accessing public and private variables form private function
        console.log("From private function: " + this.testPublicVariable + "  " + _[this.id].testPrivateVariable);
    };
    // } ***

    return BaseTransformerStrategy;
})();

Application.DataProcessor.BaseTransformer = (function(){

    function BaseTransformer() {

        Application.DataProcessor.BaseTransformerStrategy.call(this);
    };
    Application.Helper.inherit(BaseTransformer, Application.DataProcessor.BaseTransformerStrategy);

    var privateMethods = Object.create(BaseTransformer.prototype);

    return BaseTransformer;
})();

// country visual
Application.DataProcessor.CountriesVisualTransformer = (function(){

    function CountriesVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(CountriesVisualTransformer, Application.DataProcessor.BaseTransformer);

    CountriesVisualTransformer.prototype.transform = function(data) {

      var transData = [];

        $.each( data, function (index, item ) {

          var obj = {};
          obj.countrycode = item.countrycode || "";
          obj.countryname = item.countryname || "";
          obj.percent = item.percent || 0;
          transData.push(obj);

         });


        return transData;
    };

    return CountriesVisualTransformer;

})();

// point visual
Application.DataProcessor.PointsVisualTransformer = (function(){

    function PointsVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(PointsVisualTransformer, Application.DataProcessor.BaseTransformer);

    PointsVisualTransformer.prototype.transform = function(data) {
         
        if(data[0].latitude == "" && data[0].longitude == ""){
             var transData = [];  
      
            $.each( data, function (index, item ) {
              
              var obj = {};
              obj.countrycode = item.countrycode || "";
              obj.countryname = item.countryname || "";
              obj.percent = item.percent || 0;
              transData.push(obj);

             });


            return transData;
        }
        
        return data
    };

    return PointsVisualTransformer;

})();

// point visual
Application.DataProcessor.DynamicVisualTransformer = (function(){

    function DynamicVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(DynamicVisualTransformer, Application.DataProcessor.BaseTransformer);

    DynamicVisualTransformer.prototype.transform = function(data) {

        for (var i = 0; i < data.length; ++i) {
            if (data[i].timestamp !== "") {
                data[i].timestamp = Number(data[i].timestamp);
            } else {
                data[i].timestamp = 0;
            }
        }
        return data;
    };

    return DynamicVisualTransformer;

})();

// flightPath visual
Application.DataProcessor.GraphTransformer = (function(){

    function GraphTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(GraphTransformer, Application.DataProcessor.BaseTransformer);

    GraphTransformer.prototype.transform = function(data) {
        return data;
    };

    return GraphTransformer;

})();