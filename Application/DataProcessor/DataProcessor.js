var Application = Application || {};

Application.DataProcessor = {};

// processor module

// TODO: consider making processor module a singleton

Application.DataProcessor.ProcessorModule = (function() {

	var dataTypedProcessor = function(dOptions) {
		
		var options = {};
		switch(dOptions.dataType) {

			case "tweet":
			  options.parserType = "tweetParser";
			  break;
			case "spreadSheet":
			  options.parserType = "spreadSheetParser";
			  break;
			case "csv":
			  options.parserType = "csvParser";
			  break;    
		}

		var parser = Application.DataProcessor.ParserFactory.createParser(options);
		var dtProcessor = new Application.DataProcessor.BaseProcessor(parser);
		return dtProcessor;
	};

	var visualizationTypedProcessor = function(vOptions) {

		var vtProcessor = null;
		return vtProcessor;
	};

	return {

		processData: function(data, options) {

			var pData = null;

			var dtProcessor = dataTypedProcessor(options);
			// preprocess data depending on its type
			pData = dtProcessor.process(data);

			var vtProcessor = visualizationTypedProcessor(options);
			// transform preprocessed data depending on visualization type

			return pData;
		}
	};
})();

// processor

Application.DataProcessor.BaseProcessor = function(strategy) {

	this.strategy = strategy;
};

Application.DataProcessor.BaseProcessor.prototype.process = function(data) {

    var pData = this.strategy.process(data);
    return pData;
};

// strategy

Application.DataProcessor.BaseStrategy = function() {};

Application.DataProcessor.BaseStrategy.prototype.process = function(data) {

    throw 'Please, define an abstract interface.';
};

// parser
// tweet

Application.DataProcessor.TwitParser = function(options) {};
Application.Helper.inheritPrototype(Application.DataProcessor.TwitParser, Application.DataProcessor.BaseStrategy);

Application.DataProcessor.TwitParser.prototype.process = function(data) {

 	var filter = {
        longitude: "geo.coordinates[1]",
        latitude: "geo.coordinates[0]",
        text: "text",
        timestamp: "timestamp_ms",
    };
    var pData = Application.Filter.extractJSON(filter, data);
 	return pData;

 	// return data;
};

// spreadsheet

Application.DataProcessor.SpreadSheetParser = function(options) {};
Application.Helper.inheritPrototype(Application.DataProcessor.SpreadSheetParser, Application.DataProcessor.BaseStrategy);

Application.DataProcessor.SpreadSheetParser.prototype.process = function(data) {

	// var pData = null;
 	// return pData;
 	return data;
};

// csv

Application.DataProcessor.CSVParser = function(options) {};
Application.Helper.inheritPrototype(Application.DataProcessor.CSVParser, Application.DataProcessor.BaseStrategy);

Application.DataProcessor.CSVParser.prototype.process = function(data) {

	// var pData = null;
 	// return pData;
 	return data;
 };

// parser factory

Application.DataProcessor.ParserFactory = (function() {

	var parserClass = Application.DataProcessor.TwitParser;

	return {

		createParser: function(options) {
		 
			switch(options.parserType) {

				case "tweetParser":
				  parserClass = Application.DataProcessor.TwitParser;
				  break;
				case "spreadSheetParser":
				  parserClass = Application.DataProcessor.SpreadSheetParser;
				  break;
				case "csvParser":
				  parserClass = Application.DataProcessor.CSVParser;
				  break;    
			}
			return new parserClass(options);
		}
	};
})();

// transformer

// ...

























// ---

