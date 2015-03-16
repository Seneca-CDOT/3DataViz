var App = App || {};

App.Helper = {

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
  }

}