var Application = Application || {};

Application.DataProcessor = {};

// processor module

Application.DataProcessor.ProcessorModule = (function() {

    // the literal object is returned
    var privateMethods = {};
    privateMethods.dataTypedProcessor = function(dOptions) {

        var options = {};
        switch (dOptions.dataType) {

            case "twitter":
                options.parserType = "tweetParser";
                break;
            case "spreadSheet":
                options.parserType = "spreadSheetParser";
                break;
            case "csv":
                options.parserType = "csvParser";
                break;
            case "googleTrends":
                options.parserType = "googleTrendsParser";
                break;
        }

        var parser = Application.DataProcessor.ParserFactory.createParser(options);
        var dtProcessor = new Application.DataProcessor.BaseProcessor(parser);
        return dtProcessor;
    };

    privateMethods.visualizationTypedProcessor = function(vOptions, data) {

        var options = {};
        switch (vOptions.visualizationType) {

            case "countries":
                options.transformerType = "countriesVisualTransformer";
                break;
            case "points":
                options.transformerType = "pointsVisualTransformer";
                break;
            case "dynamic":
                options.transformerType = "dynamicVisualTransformer";
                break;
            case "graph":
                options.transformerType = "graphVisualTransformer";
                break;
        }

        var transformer = Application.DataProcessor.TransformerFactory.createTransformer(options);
        var vtProcessor = new Application.DataProcessor.BaseProcessor(transformer);
        return vtProcessor;
    };

    // by doing this you have got an access to the public methods from private methods
    var publicMethods = {};
    publicMethods.processData = function(data, options) {

        console.log("Raw Data =====");
        console.log(data);

        var pData = null;

        var dtProcessor = privateMethods.dataTypedProcessor(options);
        // preprocess data depending on its type
        pData = dtProcessor.process(data);

        console.log("Processed Data =====");
        console.log(pData);

        return pData;
    };

    publicMethods.transformData = function(data, options) {

        var pData = null;

        var vtProcessor = privateMethods.visualizationTypedProcessor(options);

        // transform preprocessed data depending on visualization type
        pData = vtProcessor.transform(data);

        console.log("transformed Data =====");
        console.log(pData);

        // return tData;
        return pData;
    };

    return {

        processData: publicMethods.processData,
        transformData: publicMethods.transformData
    };
})();

// processor

Application.DataProcessor.BaseProcessor = (function() {

    // private store
    var _ = {};
    var uid = 0;

    function BaseProcessor(strategy) {

        _[this.id = uid++] = {};
        _[this.id].strategy = strategy;
    };

    BaseProcessor.prototype.process = function(data) {

        var pData = _[this.id].strategy.process(data);
        return pData;
    };

    BaseProcessor.prototype.transform = function(data) {

        var tData = _[this.id].strategy.transform(data);
        return tData;
    };

    var privateMethods = Object.create(BaseProcessor.prototype);
    // privateMethods.myPrivateMethod = ...

    return BaseProcessor;
})();