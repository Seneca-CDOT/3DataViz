var Application = Application || {};

Application.DataProcessor.TransformerFactory = (function() {

    var TransformerClass = Application.DataProcessor.PointVisualTransformer;

    var publicMethods = {};
    publicMethods.createTransformer = function(options) {
        console.log(options);
        switch (options.transformerType) {

            case "countryVisualformer":
                console.log("countryVisualformer");
                TransformerClass = Application.DataProcessor.CountryVisualTransformer;
                break;
            case "pointsVisualTransformer":
                console.log("pointsVisualTransformer");
                TransformerClass = Application.DataProcessor.PointVisualTransformer;
                break;
            case "flightPathTransformer":
                console.log("flightPathTransformer");
                TransformerClass = Application.DataProcessor.FlightPathTransformer;
                break;
        }
        console.log(TransformerClass);
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
Application.DataProcessor.CountryVisualTransformer = (function(){

    function CountryVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(CountryVisualTransformer, Application.DataProcessor.BaseTransformer);

    CountryVisualTransformer.prototype.transform = function(data) {
        return data;
    };

    return CountryVisualTransformer;

})();

// point visual
Application.DataProcessor.PointVisualTransformer = (function(){

    function PointVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(PointVisualTransformer, Application.DataProcessor.BaseTransformer);

    PointVisualTransformer.prototype.transform = function(data) {

        for (var i = 0; i < data.length; ++i) {

            if (data[i].timestamp !== "") {

                data[i].timestamp = Number(data[i].timestamp);
            } else {

                data[i].timestamp = 0;
            }
        }
        return data;
    };

    return PointVisualTransformer;

})();

// flightPath visual
Application.DataProcessor.FlightPathTransformer = (function(){

    function FlightPathTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(FlightPathTransformer, Application.DataProcessor.BaseTransformer);

    FlightPathTransformer.prototype.transform = function(data) {
        return data;
    };

    return FlightPathTransformer;

})();