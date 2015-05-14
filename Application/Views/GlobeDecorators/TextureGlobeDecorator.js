var Application = Application || {};

// Application.BaseTextureGlobeView = Application.BaseGlobeView.extend({

//     // framework methods
//     initialize: function() {

//         Application.BaseGlobeView.prototype.initialize.call(this);

//         // HexMap is the map for clicking on countries.
//         // TextureMap is the actual thing that's shown
//         this.hexMap = 'Assets/Images/textures/hexMapMin.png';
//         this.textureMap = 'Assets/Images/textures/worldMatrix.jpg';

//         //this is the canvas size and its attributes.
//         this.canvas = null;
//         this.tw = this.th = 1024;

//         // this is for generating the texture. with factor 3 you'll get a 9k X 3k texture
//         this.factor = 3;
//         this.texHeight = 1024 * this.factor;
//         this.texWidth = this.texHeight * this.factor;
//     },
//     // member methods
//     initGlobe: function() {

//         Application.BaseGlobeView.prototype.initGlobe.call(this);

//         var texture = THREE.ImageUtils.loadTexture(this.textureMap);
//         var material = new THREE.MeshBasicMaterial({
//             color: 0xFFFFFF,
//             map: texture
//         });

//         if (this.globe.material != null) {

//             this.globe.material.dispose();
//             this.globe.material = null;
//         }
//         this.globe.material = material;
//     },

//     // call readCountries(), supplying the countries data, to redraw the texture
//     redrawTexture: function() {

//         this.setUpCanvas();

//         var midPoint;
//         var dist = 0;
//         var canvasCtx = this.canvas.getContext("2d");

//         // This are the functions for drawing the textures.
//         // it works like this: readCountries() is going to read 
//         // each and every country from that huge countries file and then
//         // pass it to addBorders() with a color to draw it on the canvas.
//         // Canvas needs to be set up before hand.

//         function readCountries(data) {

//             var r = 00;
//             var g = 128;
//             var b = 00;

//             var threshold = 'b0';

//             // var hr, hb,hg;
//             // var hg = '55';

//             var color = 0;
//             console.log("'type' : 'countryColorTable',");
//             console.log("'elements' : [");
//             var i = 0
//             var nameC;
//             for (; i < data[0].features.length; i++) {

//                 color = Application.Helper.decToHex(r) + Application.Helper.decToHex(g) + Application.Helper.decToHex(b);

//                 r = (r > 100 ? r = 0 : r);
//                 g = (g > 250 ? g = 0 : g);
//                 b = (b > 110 ? b = 0 : b);

//                 if (b > parseInt(threshold, 16)) {
//                     g = ((b % 8 == 0) ? ++g : g);
//                     b++;
//                 } else {
//                     r = ((b % 16 == 0) ? ++r : r);
//                     b++;
//                 }
//                 nameC = data[0].features[i].properties.NAME;
//                 console.log("  {");
//                 console.log("  'color' : '" + color + "',");
//                 console.log("  'country' : '" + nameC + "',");

//                 addBorders(data[0].features[i].geometry.coordinates, data[0].features[i].properties.NAME, color);

//                 console.log("  'countrySize' : " + dist + ",");
//                 console.log("  'midPoint' : {");
//                 console.log("    'x' : " + midPoint.x + ", ");
//                 console.log("    'y' : " + midPoint.y + ", ");
//                 console.log("    'z' : " + midPoint.z + ", ");
//                 console.log("  }");

//                 console.log((i == data[0].features.length - 1) ? " }" : " },");
//             }
//             console.log("]");
//             console.log("}");
//         }

//         function addBorders(coordinates, name, color) {

//             //var country = data.features[0].geometry.coordinates[0];
//             if (coordinates[0].length !== 2) {

//                 for (var i = 0; i < coordinates.length; i++) {

//                     addBorders(coordinates[i], name, color);
//                 }
//                 return;
//             }

//             var point = Application.Helper.geoToxy(coordinates[0][0], coordinates[0][1]);

//             canvasCtx.beginPath();
//             canvasCtx.lineWidth = "2";
//             canvasCtx.strokeStyle = "#00f100";
//             canvasCtx.moveTo(point.x, point.y);

//             var maxLon = -180;
//             var maxLat = -180;
//             var minLon = 180;
//             var minLat = 180;
//             var avgLon = 0;
//             var avgLat = 0;
//             var dist = 0;

//             for (var k = 1; k < coordinates.length; k++) {

//                 if (coordinates[k][0] > maxLon) maxLon = coordinates[k][0];
//                 if (coordinates[k][0] < minLon) minLon = coordinates[k][0];

//                 if (coordinates[k][1] > maxLat) maxLat = coordinates[k][1];
//                 if (coordinates[k][1] < minLat) minLat = coordinates[k][1];

//                 point = Application.Helper.geoToxy(coordinates[k][0], coordinates[k][1]);
//                 canvasCtx.lineTo(point.x, point.y);
//             }

//             dist = +(maxLat - minLat) + +(maxLon - minLon);
//             avgLat = (maxLat + minLat) / 2;
//             avgLon = (maxLon + minLon) / 2;

//             midPoint = Application.Helper.geoToxyz(avgLon, avgLat);

//             canvasCtx.stroke();
//             // canvasCtx.fillStyle = "#000000";
//             canvasCtx.fillStyle = "#" + color;
//             canvasCtx.fill();
//         }
//     },
//     //sets up canvas and loads hexMap for pixel clicking functionality
//     setUpCanvas: function() {

//         this.canvas = document.createElement('canvas');
//         var canvasCtx = this.canvas.getContext("2d");

//         this.canvas.backgrounColor = "0x000000";
//         this.canvas.width = this.tw;
//         this.canvas.height = this.th;

//         var image = new Image();
//         image.src = this.hexMap;
//         image.onload = (function(that) {

//             return function() {

//                 canvasCtx.drawImage(image, 0, 0);
//             };
//         })(this);
//     },

//     // interaction
//     clickOn: function(event) {

//         Application.BaseGlobeView.prototype.clickOn.call(this, event);

//         // var point = intersects[0].point;
//         // point.setLength(radius);

//         // var color = Application.Helper.getPixelClicked(point, canvasCtx)
//         // var country = Application.Helper.getCountryById(color);
//         // if(country)
//         //     this.cameraGoTo(country);
//     }
// });
