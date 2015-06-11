var Application = Application || {};

Application.Helper = {

  /**
   * Load files orderly.
   * @param files An array of files.
   * @param callback A callback function to be fired when it complete.
   */
  requireOrderly: function(files, callback){
    Application.Helper.loadFiles(files, 0, function(){
      if(typeof callback === 'function'){
        callback();
      }
    });
  },

  /**
   * Load files recursively.
   */
  loadFiles : function(files, index, callback){
    if(typeof files[index] === 'undefined'){ // load completed.
      if(typeof callback === 'function'){
        callback();
      }
    }else{
      var _files;
      if(typeof files[index] === 'string'){
        _files = [files[index]]; // to load individual file by require.js.
      }else{
        _files = files[index];
      }
      console.log(_files);
      require(_files, function() {
        console.log("loaded.");
        Application.Helper.loadFiles(files, index+1, callback);
      });
    }
  },

  /**
   * Inherits prototype of the parent object and copies it into the child object.
   * @param childObject A child object.
   * @param parentObject A parent object.
   */
  inherit: function (childObject, parentObject) {

    var copyOfParent = Object.create(parentObject.prototype);

    copyOfParent.constructor = childObject;
    childObject.prototype = copyOfParent;
  },

  /**
   * Convert Geo coordinates to XYZ coordinates
   * @return THREE.Vector3
   */
  geoToxyz : function(lon, lat, r) {

    var r = r || 1;

    // var phi = lat * Math.PI / 180;
    // var theta = (lon + 90) * Math.PI / 180;
    // var x = r * Math.cos(phi) * Math.sin(theta);
    // var y = r * Math.sin(phi);
    // var z = r * Math.cos(phi) * Math.cos(theta);

    var phi = +(90 - lat) * 0.01745329252;
    var the = +(180 - lon) * 0.01745329252;
    var x = r * Math.sin(the) * Math.sin(phi) * -1;
    var z = r * Math.cos(the) * Math.sin(phi);
    var y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  },
  geoToxy: function(lon, lat, r) {

    var r = r || 1;

    var x = 0;
    x = this.map(lon, -180, 180, 0, 1024);

    var y = 0;
    y = this.map(-lat,-90,90,0, 1024);

    var z = 0;

    return new THREE.Vector3(x, y, z);
  }, 
  map: function ( x,  in_min,  in_max,  out_min,  out_max){
      return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  },    
  /**
   * Convert decimal to HEX
   * @return hex
   */
  decToHex : function(c){
    var hc;
    if (c < 10){ hc = ( '0' + c.toString(16) ); }
    else if(c < 17){ hc = c.toString(16) + '0';}
    else{hc = c.toString(16);}
    return hc;
  },

  /**
   * Convert RBG to HEX
   * @return hex
   */
  rgbToHex : function(r, g, b) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  },

  /**
   * Convert component to HEX
   * @return hex
   */
  componentToHex : function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  },

  getPixelClicked: function (place, canvasContext){
    var x = place.x;
    var y = place.y;
    var z = place.z;

    var lat = Math.asin( y / radius) * (180/Math.PI); // LAT in radians
    var lon = Math.atan2(z, x) * (180/Math.PI) * -1; // LON in radians

    var p = this.geoToxy(lon,lat);

    var imageData = canvasContext.getImageData(p.x, p.y, 1, 1);
    var pixel = imageData.data;

    var r = pixel[0],
        g = pixel[1],
        b = pixel[2];

    var color = this.decToHex(r) + 
                this.decToHex(g) + 
                this.decToHex(b);

    return color;
  },
  getCountryById: function(id){
    var country = countiresList[0].elements;
    if(id == '000000')
        return false;
    for(var i = 0 ; i < country.length; i++){
        if( country[i].id == id ){
            return country[i];
        }
    }
  },
  getCountryByName: function(name){
    var country = countiresList[0].elements;
    if(id == '')
        return false;
    for(var i = 0 ; i < country.length; i++){
        if( country[i].name == name ){
            return country[i];
        }
    }
  },

convertDateTimeToStamp: function(datetime) {

       var dateString = datetime,
           dateParts = dateString.split(' '),
           timeParts = dateParts[1].split(':'),
           date;

       dateParts = dateParts[0].split('/');

       date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]);

       console.log(date.getTime());

       return date.getTime();

   }
}