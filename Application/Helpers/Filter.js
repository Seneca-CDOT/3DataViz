var Application = Application || {};

Application.Filter = {

  /**
   * Get a value from the object in the path.
   * @param  {String} path .
   * @param  {Object} object [description]
   * @return {String} value of the object.
   */
  _getValue: function (path, object){
    path.split(/[.\[\]]/).forEach(function(item){
      object = (item !== "") ? object[item] : object;
    });
    return object;
  },

  /**
   * Extract data from objects. What data to extract from where is specified on filter object.
   * @param  {Object} filter : it tells which information to take from the object.
   * @param  {Object} object : original data to filter.
   * @return {Array} filtered objects.
   */
  extractJSON: function(filter, objects){

    var collection = new Array();
    objects.forEach(function(object) {
      var obj = {}
      for(path in filter){
        obj[path] = Application.Filter._getValue(filter[path], object);
      }
      collection.push(obj);
    });
    return collection;

  },

  /**
   * Filter for spreadSheet:
   * Note: Spread sheet has to have headers in row 1. Which represents attributes.
   * @param  {Object} filter : it tells which information to take from the object.
   * @param  {Object} object : original data to filter.
   * @return {Array} filtered objects.
   */
  extractSpreadSheet: function(filter, objects){

    var collection = new Array();
    var entries = objects.feed.entry;
    var headers = {};

    //get headers
    var count = 0;
    for(var i=0; entries[i].title.$t.match(/^.1$/g); i++){
      var cellId = entries[i].title.$t;
      headers[cellId.substring(0,1)] = entries[i].content.$t;
      count++;
    }
    headers.length = count;

    //get objects
    var obj = {};
    var numRow = 2;
    var objCount = 0;
    for(var i=headers.length; i<entries.length; i++){
      var cellPrefix = entries[i].title.$t.substring(0,1);
      var cellNum = entries[i].title.$t.substring(1);
      if(cellNum != numRow){
        collection.push(obj);
        obj = {};
        numRow = cellNum;
      }
      if(cellNum == numRow){
        if(filter[headers[cellPrefix]] !== undefined){
          obj[headers[cellPrefix]] = entries[i].content.$t;
        }
      }
    }
    collection.push(obj);

    return collection;
  }

};