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
    publicMethods.processData = function(data, options, complete) {

        var dtProcessor = privateMethods.dataTypedProcessor(options);
        // preprocess data depending on its type
        dtProcessor.process(data, complete);
        
    };

    publicMethods.transformData = function(data, options, complete) {

        var vtProcessor = privateMethods.visualizationTypedProcessor(options);
        // transform preprocessed data depending on visualization type
        vtProcessor.transform(data, complete);

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

    BaseProcessor.prototype.process = function(data, complete) {

        var pData = _[this.id].strategy.process(data, complete);
        return pData;
    };

    BaseProcessor.prototype.transform = function(data, complete) {

        var tData = _[this.id].strategy.transform(data, complete);
        return tData;
    };

    var privateMethods = Object.create(BaseProcessor.prototype);
    // privateMethods.myPrivateMethod = ...

    return BaseProcessor;
})();