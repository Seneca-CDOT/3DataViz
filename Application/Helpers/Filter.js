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

  }

};