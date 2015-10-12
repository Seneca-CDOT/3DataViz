var Application = Application || {};

Application.DataProcessor.TransformerFactory = (function() {

    var TransformerClass = Application.DataProcessor.PointsVisualTransformer;

    var publicMethods = {};
    publicMethods.createTransformer = function(options) {

        switch (options.transformerType) {

            case "countriesVisualTransformer":
                // console.log("countriesVisualTransformer");
                TransformerClass = Application.DataProcessor.CountriesVisualTransformer;
                break;
            case "pointsVisualTransformer":
                // console.log("pointsVisualTransformer");
                TransformerClass = Application.DataProcessor.PointsVisualTransformer;
                break;
            case "dynamicVisualTransformer":
                // console.log("dynamicVisualTransformer");
                TransformerClass = Application.DataProcessor.DynamicVisualTransformer;
                break;
            case "graphVisualTransformer":
                // console.log("graphVisualTransformer");
                TransformerClass = Application.DataProcessor.GraphTransformer;
                break;
            case "pointcloudVisualTransformer":
                // console.log("pointcloudVisualTransformer");
                TransformerClass = Application.DataProcessor.PointCloudTransformer;
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

    BaseTransformerStrategy.prototype.transform = function(data, complete) {

        throw 'Please, define an abstract interface.';
    };

    // { *** for testing purposes
    BaseTransformerStrategy.prototype.testPublicFunction1 = function(data) {

        // calling private function from public
        privateMethods.testPrivateFunction1.call(this);
    };

    BaseTransformerStrategy.prototype.testPublicFunction2 = function(data) {

        // accessing public and private variables form public function
        // console.log("From public function: " + this.testPublicVariable + "  " + _[this.id].testPrivateVariable);
    };

    // define private methods after prototype has been inhereted and defined

    // by doing this you have got an access to the public methods from private methods
    var privateMethods = Object.create(BaseTransformerStrategy.prototype);
    privateMethods.testPrivateFunction1 = function() {

        // calling public function from private
        privateMethods.testPublicFunction2.call(this);

        // accessing public and private variables form private function
        // console.log("From private function: " + this.testPublicVariable + "  " + _[this.id].testPrivateVariable);
    };
    // } ***

    return BaseTransformerStrategy;
})();

Application.DataProcessor.BaseTransformer = (function() {

    function BaseTransformer() {

        Application.DataProcessor.BaseTransformerStrategy.call(this);
    };
    Application.Helper.inherit(BaseTransformer, Application.DataProcessor.BaseTransformerStrategy);

    var privateMethods = Object.create(BaseTransformer.prototype);

    BaseTransformer.prototype.transform = function(data, complete) {

        throw 'Please, define an abstract interface.';
    };

    return BaseTransformer;
})();

// country visual
Application.DataProcessor.CountriesVisualTransformer = (function() {

    function CountriesVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(CountriesVisualTransformer, Application.DataProcessor.BaseTransformer);

    CountriesVisualTransformer.prototype.transform = function(data, complete) {

        var transData = [];

        $.each(data, function(index, item) {

            var obj = {};

            $.each(item, function(attr, value) {

                var parserAttr = _.invert(Application.attrsMap)[attr];

                if (parserAttr) {

                    if (parserAttr == 'value') value = Application.Helper.getNumber(value);

                    obj[parserAttr] = value;

                } else {

                    // console.log("Attribute " + attr + " wasn't included");
                }

            });

            transData.push(obj);

        });

        if (typeof complete === "function") complete(transData);
    };

    return CountriesVisualTransformer;

})();

// point visual
Application.DataProcessor.PointsVisualTransformer = (function() {

    function PointsVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(PointsVisualTransformer, Application.DataProcessor.BaseTransformer);

    PointsVisualTransformer.prototype.transform = function(data, complete) {

        var transData = [];

        var parserAttrs = _.invert(Application.attrsMap);

        $.each(data, function(index, item) {

            var obj = {};

            $.each(item, function(attr, value) {

                var parserAttr = parserAttrs[attr];

                if (parserAttr) obj[parserAttr] = value;

          //      else console.log("Attribute " + attr + " wasn't included");

            });

            transData.push(obj);

        });

        if (typeof complete === "function") complete(transData);
    };

    return PointsVisualTransformer;

})();

// Dynamic visual
Application.DataProcessor.DynamicVisualTransformer = (function() {

    function DynamicVisualTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(DynamicVisualTransformer, Application.DataProcessor.BaseTransformer);

    DynamicVisualTransformer.prototype.transform = function(data, complete) {
      var transData = [];
      var parserKeys = _.keys(Application.attrsMap);

      $.each(data, function(index, item) {

          var obj = {};

          $.each(parserKeys, function(index, key) {

             obj[key] = item[Application.attrsMap[key]] || 0;

          });

          transData.push(obj);

      });

      if( typeof complete === "function" ) complete(transData);

    };

    return DynamicVisualTransformer;

})();

// flightPath visual
Application.DataProcessor.GraphTransformer = (function() {

    function GraphTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(GraphTransformer, Application.DataProcessor.BaseTransformer);

    GraphTransformer.prototype.transform = function(data, complete) {

        var transData = [];

        var parserAttrs = _.invert(Application.attrsMap);

        $.each(data, function(index, item) {

            var obj = {};

            $.each(item, function(attr, value) {

                var parserAttr = parserAttrs[attr];

                if (parserAttr) {

                    if (parserAttr == 'value') value = Application.Helper.getNumber(value);

                    obj[parserAttr] = value;

                } else {

                    // console.log("Attribute " + attr + " wasn't included");
                }

            });

            transData.push(obj);

        });

        if (typeof complete === "function") complete(transData);
    };

    return GraphTransformer;

})();

// point cloud visual
Application.DataProcessor.PointCloudTransformer = (function(){

    function PointCloudTransformer() {

        Application.DataProcessor.BaseTransformer.call(this);
    };
    Application.Helper.inherit(PointCloudTransformer, Application.DataProcessor.BaseTransformer);

    PointCloudTransformer.prototype.transform = function(data, complete) {

        var transData = [];

        $.each(data, function(index, item) {

            var obj = {};

            $.each(item, function(attr, value) {

                var parserAttr = _.invert(Application.attrsMap)[attr];

                if (parserAttr) {

                    obj[parserAttr] = value;

                }

            });

            transData.push(obj);

        });

        if( typeof complete === "function" ) complete(transData);
    };

    return PointCloudTransformer;

})();
