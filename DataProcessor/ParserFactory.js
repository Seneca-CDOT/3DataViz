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

// parser

Application.DataProcessor.BaseParser = (function() {

    function BaseParser() {

        Application.DataProcessor.BaseStrategy.call(this);

    };
    Application.Helper.inherit(BaseParser, Application.DataProcessor.BaseStrategy);

    BaseParser.prototype.process = function(data, complete) {

        var pData = this.parse(data, complete);
        return pData;
    };

    // BaseParser.prototype.preProcess = function(data, complete) {

    //     var pData = this.preParse(data, complete);
    //     return pData;
    // };

    BaseParser.prototype.parse = function(data, complete) {

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

    TweetParser.prototype.parse = function(data, complete) {

        var filter = {
            longitude: "geo.coordinates[1]",
            latitude: "geo.coordinates[0]",
            text: "text",
            timestamp: "timestamp_ms",
        };
        var pData = privateMethods.extract.call(this, filter, data);
        Application._vent.trigger('controlpanel/subview/vizType');
        if (typeof complete === "function") complete(pData);
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

    return TweetParser;
})();

// google trends

Application.DataProcessor.GoogleTrendsParser = (function() {

    function GoogleTrendsParser() {

    };
    Application.Helper.inherit(GoogleTrendsParser, Application.DataProcessor.BaseParser);

    GoogleTrendsParser.prototype.parse = function(data, complete) {

        var filter = {
            countryname: "",
            countrycode: "c[0].v",
            value: "c[1].v",
            longitude: "",
            latitude: "",
            timestamp: "",
            text: ""

        };
        var pData = privateMethods.extract.call(this, filter, data);
        Application._vent.trigger('controlpanel/subview/vizType');
        if (typeof complete === "function") complete(pData);

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
                if (filter[path] == "") {
                    obj[path] = "";
                } else {

                    obj[path] = that.getValue(filter[path], object);
                }
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

    // SpreadSheetParser.prototype.preParse = function(data, complete) {

    //     var that = this;

    //     var pData = privateMethods.extractHeaders.call(this, data);
    //     // return pData;
    //     Application._vent.trigger('matcher/on');
    //     if (typeof complete === "function") complete(pData);
    // };

    SpreadSheetParser.prototype.parse = function(data, callbacks) {

        // TODO: to Dima Yastretsky
        var pData = privateMethods.extractSpreadSheet.call(this, data, callbacks);
        // return pData;
        //if (typeof complete === "function") complete(pData);
    };

    var privateMethods = Object.create(SpreadSheetParser.prototype);

    privateMethods.extractSpreadSheet = function(objects, callbacks) {
        var collection = new Array();
        var entries = objects.feed.entry;
        var headers = {};

        //get headers
        var count = 0;
        for (var i = 0; entries[i].title.$t.match(/^.1$/g); i++) {
            var cellId = entries[i].title.$t;
            headers[cellId.substring(0, 1)] = entries[i].content.$t;
            count++;
        }
        
        if (typeof callbacks.preparsed === "function") callbacks.preparsed(headers);
        
        headers.length = count;


        //get objects
        var obj = {};
        var numRow = 2;
        var objCount = 0;
        for (var i = headers.length; i < entries.length; i++) {
            var cellPrefix = entries[i].title.$t.substring(0, 1);
            var cellNum = entries[i].title.$t.substring(1);
            if (cellNum != numRow) {
                collection.push(obj);
                obj = {};
                numRow = cellNum;
            }
            if (cellNum == numRow) {
                obj[headers[cellPrefix]] = entries[i].content.$t;
            }
        }
        collection.push(obj);

        if (typeof callbacks.complete === "function") callbacks.complete(collection);

        return collection;
    }

    return SpreadSheetParser;
})();

// csv

Application.DataProcessor.CSVParser = (function() {

    function CSVParser() {

    };
    Application.Helper.inherit(CSVParser, Application.DataProcessor.BaseParser);

    CSVParser.prototype.parse = function(file, callbacks) {

        Papa.parse(file, {
            preview: 1,
            header: true,
            complete: function(response){
                console.log("Preparse:", response.meta.fields);
        if (typeof callbacks.preparsed === "function") callbacks.preparsed(response.meta.fields);
                // Application._vent.trigger('data/parsed', that.getViewConfigs(response.data));
            }
        });

       
        Papa.parse(file, {
            // worker: true,
            header: true,
            complete: function(response) {
                // if (typeof complete === "function") complete(response);
            if (typeof callbacks.complete === "function") callbacks.complete(response.data);
                //Application._vent.trigger('matcher/on');
            }
        });

    };
    return CSVParser;
})();
