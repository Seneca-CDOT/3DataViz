var Application = Application || {};

Application.Filter = {

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