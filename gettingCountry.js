//remember to include the countriesList.js before this or whatever

var hexMap = 'textures/hexMapMin.png';
var canvas, canvasCtx;
var tw = th = 1024;

//sets up canvas and loads hexMap for pixel clicking functionality
function setUpCanvas(tex){

    canvas = document.createElement('canvas');
    canvas.backgrounCdolor = "0x000000";
    
    canvasCtx = canvas.getContext("2d");
    
    var image = new Image();
    
    image.onload = function () {
        canvasCtx.drawImage(image, 0, 0); // draw the image on the canvas
    }
    image.src = tex;
    
    canvas.width = tw;
    canvas.height = th;

    document.body.appendChild(canvas);
}

//this is getting the clicked pixel, just 
function getPixelOnGeo(lon, lat, canvasContext){

    var p = geoToxy(lon,lat);

    var imageData = canvasContext.getImageData(p.x, p.y, 1, 1);
    var pixel = imageData.data;

    var r = pixel[0], 
    g = pixel[1], 
    b = pixel[2];

    var color = decToHex(r) + decToHex(g) + decToHex(b);

    return color;
}

function getCountryById(id){
    var country = countiresList[0].elements;
    if(id == '000000')
        return false;
    for(var i = 0 ; i < country.length; i++){
        if( country[i].id == id ){
            return country[i];
        }
    }
}

function getCountryByName(name){
    var country = countiresList[0].elements;
    if(id == '')
        return false;
    for(var i = 0 ; i < country.length; i++){
        if( country[i].name == name ){
            return country[i];
        }
    }
}

function geoToxy(lon, lat) {

    var r = r || 1;

    var x = 0;
    x = map(lon, -180, 180, 0, tw);

    var y = 0;
    y = map(-lat,-90,90,0, th);

    var z = 0;

    return new THREE.Vector3(x, y, z);
}

//this should do the trick
getCountryById(getPixelOnGeo(lon, lat, canvasCtx));

//returns a json object like:
//   'id' : '068051',
//   'country' : 'Hungary',
//   'countrySize' : 9.603630065917969,
//   'midPoint' : {
//     'x' : 3.204258173007379, 
//     'y' : 3.6667564410959486, 
//     'z' : 1.1347364286021617, 
//    }
//
//where id is the color on the hexMap