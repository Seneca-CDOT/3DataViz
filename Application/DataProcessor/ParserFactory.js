var Application = Application || {};

// { ***

// To get some additional explanations about the coding style 
// and conventions that are used here, please review this article.

// http://philipwalton.com/articles/implementing-private-and-protected-members-in-javascript/
// http://addyosmani.com/resources/essentialjsdesignpatterns/book/#factorypatternjavascript

// } ***

// parser factory

Application.DataProcessor.ParserFactory = (function() {

    var parserClass = Application.DataProcessor.TweetParser;

    var publicMethods = {};
    publicMethods.createParser = function(options) {

        switch (options.parserType) {

            case "tweetParser":
                parserClass = Application.DataProcessor.TweetParser;
                break;
            case "spreadSheetParser":
                parserClass = Application.DataProcessor.SpreadSheetParser;
                break;
            case "csvParser":
                parserClass = Application.DataProcessor.CSVParser;
                break;
            case "googleTrendsParser":
                parserClass = Application.DataProcessor.GoogleTrendsParser;
                break;
        }
        return new parserClass(options);
    };

    return {

        createParser: publicMethods.createParser
    };
})();

// strategy

Application.DataProcessor.BaseStrategy = (function() {

    // private store
    var _ = {};
    var uid = 0;

    function BaseStrategy() {

        this.testPublicVariable = "test-public";

        _[this.id = uid++] = {};
        _[this.id].testPrivateVariable = "test-private";
    };
    // inherite the base interface if needed
    // Application.Helper.inherit(...) 

    BaseStrategy.prototype.process = function(data) {

        throw 'Please, define an abstract interface.';
    };

    // { *** for testing purposes
    BaseStrategy.prototype.testPublicFunction1 = function(data) {

        // calling private function from public
        privateMethods.testPrivateFunction1.call(this);
    };

    BaseStrategy.prototype.testPublicFunction2 = function(data) {

        // accessing public and private variables form public function
        console.log("From public function: " + this.testPublicVariable + "  " + _[this.id].testPrivateVariable);
    };

    // define private methods after prototype has been inhereted and defined

    // by doing this you have got an access to the public methods from private methods
    var privateMethods = Object.create(BaseStrategy.prototype);
    privateMethods.testPrivateFunction1 = function() {

        // calling public function from private
        privateMethods.testPublicFunction2.call(this);

        // accessing public and private variables form private function
        console.log("From private function: " + this.testPublicVariable + "  " + _[this.id].testPrivateVariable);
    };
    // } ***

    return BaseStrategy;
})();

// Play with this.
// var p1 = new Application.DataProcessor.BaseParser();
// p1.testPublicFunction1();

// parser

Application.DataProcessor.BaseParser = (function() {

    function BaseParser() {

        Application.DataProcessor.BaseStrategy.call(this);
    };
    Application.Helper.inherit(BaseParser, Application.DataProcessor.BaseStrategy);

    BaseParser.prototype.process = function(data) {

        var pData = this.parse(data);
        return pData;
    };

    BaseParser.prototype.parse = function(data) {

        throw 'Please, define an abstract interface.';
    };

    /**
     * Get a value from the object in the path.
     * @param  {String} path .
     * @param  {Object} object [description]
     * @return {String} value of the object.
     */
    BaseParser.prototype.getValue = function(path, object) {

        path.split(/[.\[\]]/).forEach(function(item) {

            object = (item !== "") ? object[item] : object;
        });
        return object;
    };

    var privateMethods = Object.create(BaseParser.prototype);
    // privateMethods.myPrivateMethod = ...

    return BaseParser;
})();

// tweet

Application.DataProcessor.TweetParser = (function() {

    function TweetParser() {

        Application.DataProcessor.BaseParser.call(this);

    };
    Application.Helper.inherit(TweetParser, Application.DataProcessor.BaseParser);

    TweetParser.prototype.parse = function(data) {

        var filter = {
            longitude: "geo.coordinates[1]",
            latitude: "geo.coordinates[0]",
            text: "text",
            timestamp: "timestamp_ms",
        };
        var pData = privateMethods.extract.call(this, filter, data);
        pData = privateMethods.transform.call(this, pData);
        return pData;
    };

    var privateMethods = Object.create(TweetParser.prototype);
    /**
     * Extract data from objects. What data to extract from where is specified on filter object.
     * @param  {Object} filter : it tells which information to take from the object.
     * @param  {Object} object : original data to filter.
     * @return {Array} filtered objects.
     */
    privateMethods.extract = function(filter, objects) {

        var that = this;
        var collection = new Array();
        objects.forEach(function(object) {

			var obj = {};
			for (path in filter) {

                obj[path] = that.getValue(filter[path], object);
            }
            collection.push(obj);
        });
        return collection;
    };

    // TODO: move to transformer
    privateMethods.transform = function(data) {

        for (var i = 0; i < data.length; ++i) {

            if (data[i].timestamp !== "") {

                data[i].timestamp = Number(data[i].timestamp);
            } else {

                data[i].timestamp = 0;
            }
        }
        return data;
    };

    return TweetParser;
})();

// google trends

Application.DataProcessor.GoogleTrendsParser = (function() {

    function GoogleTrendsParser() {

    };
    Application.Helper.inherit(GoogleTrendsParser, Application.DataProcessor.BaseParser);

    GoogleTrendsParser.prototype.parse = function(data) {

        var filter = {
            countrycode: "c[0].v",
            percent: "c[1].v"
        };
        var pData = privateMethods.extract.call(this, filter, data);
        return pData;

    };

    var privateMethods = Object.create(GoogleTrendsParser.prototype);
    /**
     * Extract data from objects. What data to extract from where is specified on filter object.
     * @param  {Object} filter : it tells which information to take from the object.
     * @param  {Object} object : original data to filter.
     * @return {Array} filtered objects.
     */
    privateMethods.extract = function(filter, objects) {

        var that = this;
        var collection = new Array();
        objects.forEach(function(object) {

            var obj = {}
            for (path in filter) {

                obj[path] = that.getValue(filter[path], object);
            }
            collection.push(obj);
        });
        return collection;
    };

    return GoogleTrendsParser;
})();

// spreadsheet

Application.DataProcessor.SpreadSheetParser = (function() {

    function SpreadSheetParser() {

    };
    Application.Helper.inherit(SpreadSheetParser, Application.DataProcessor.BaseParser);

    SpreadSheetParser.prototype.parse = function(data) {

        var filter = {

            name: "",
            longitude: "",
            latitude: ""

        };

        // TODO: to Dima Yastretsky
        var pData = Application.Filter.extractSpreadSheet(filter, data);

        return pData;
    };

    return SpreadSheetParser;
})();

// csv

Application.DataProcessor.CSVParser = (function() {

    function CSVParser() {

    };
    Application.Helper.inherit(CSVParser, Application.DataProcessor.BaseParser);

    CSVParser.prototype.parse = function(data) {

        // var pData = null;
        // return pData;
        return data;
    };

    return CSVParser;
})();
