/**
 *
 * Component
 *
 * All components will have access to the following variables in their scope:
 *
 *   VAPI - the Verold API
 *   require - requirejs
 *   THREE - THREE.JS
 *   _ - underscore.js
 *
 * All components will have the following properties assigned to them:
 *
 *   this.getEntity() - the VeroldEntity which this component is attached to
 *   this.getEvents() - global event system (bind events with .on()/.off() and trigger events with .trigger())
 *   this.getThreeObject() - returns the Three.JS object associated with this component (e.g. THREE.Object3D )
 *   this.getThreeScene() - returns the Three.JS scene that this component's entity is a part of.
 *   this.getThreeRenderer() - returns the Three.JS renderer currently being used by the engine.
 *   this.getAssetRegistry() - returns the Verold asset registry for this project.
 *
 * All of your component attributes will automatically be bound to your object,
 * you can access them via this.[attribute name].
 *
 * Alternatively, you can load in your own versions of these dependencies by
 * adding them as external dependencies for this script.
 *
 * Additional information regarding the Verold API can be found in our API docs:
 *
 *  http://assets.verold.com/doc/index.html
 */

/* global VAPI */

/**
 * A custom component class.
 *
 * @class Component
 */

var dataSet = [{
    trip: 121,
    from:
    {   city: "Beijing",
        population: 2600000,
        lat: 39.913,
        lon: 116.391
    },
    to:{
        city: "Toronto",
        population: 2600000,
        lat: 43.7,
        lon: -79.416
    }
},
{
    trip: 122,
    from:
    {   city: "Ottawa",
        population: 812129,
        lat: 45.411,
        lon: -75.698
    },
    to:
    {   city: "Vancouver",
        population: 1837969,
        lat: 49.25,
        lon: -123.119
    },
    value: 6
},
{
    trip: 125,
    from:
    {   city: "Moscow",
        population: 812129,
        lat: 55.750,
        lon: 37.616
    },
    to:
    {   city: "Cape Town",
        population: 1837969,
        lat: -33.925,
        lon: 18.423
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "Kiev",
        population: 812129,
        lat: 50.450,
        lon: 30.523
    },
    to:
    {   city: "Amsterdam",
        population: 1837969,
        lat: 52.366,
        lon: 4.900
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "London",
        population: 812129,
        lat: 51.507,
        lon: 0.127
    },
    to:
    {   city: "Pakistan",
        population: 1837969,
        lat: 33.666,
        lon: 73.166
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "Sydney",
        population: 812129,
        lat: -33.860,
        lon: 151.209
    },
    to:
    {   city: "Havana",
        population: 1837969,
        lat: 23.133,
        lon: -82.383
    },
    value: 4
},
{
    trip: 123,
    from:
        {   city: "Sao Paulo",
            lat: -23.550,
            lon: -46.633
        },
    to:
        {   city: "Scarborough",
            population: 600000,
            lat: 43.772,
            lon: -79.257
        },
    value: 5
}];

var paths = [];
var fromPoints = [];
var toPoints = [];
var movingGuys = [];

function Component() {
}

/*global VAPI*/
Component.prototype = new VAPI.VeroldComponent();

/**
 * Called as soon as the VeroldEntity begins to load.
 */
Component.prototype.init = function() {
  // this.veroldEntity is available here but the Three.JS data isn't loaded yet
};

/**
 * Called once the Three.JS data for this object is available
 */
var sphere;
var radius = 5;
var galaxyRadius = radius * 10;

function CreateEarth( _r ){
  var sphereGeom = new THREE.SphereGeometry( _r, 64, 64 );
  var material = new THREE.MeshPhongMaterial( {
    color: 0xf00,
    specular: 0xfff,
    emissive: 0x03e,
    shininess:10
  } );
  
  material.map         = THREE.ImageUtils.loadTexture('earthmap1k.jpg');
  material.bumpMap     = THREE.ImageUtils.loadTexture('earthbump1k.jpg');
  material.bumpScale   = 0.05;
  material.specularMap = THREE.ImageUtils.loadTexture('earthspec1k.jpg');
  material.specular    = new THREE.Color('white');
  
  var sph = new THREE.Mesh( sphereGeom, material );
  return sph;
}

function CreateGalaxy(){
   // create the geometry sphere
  var geometry  = new THREE.SphereGeometry(galaxyRadius, 32, 32);
  // create the material, using a texture of startfield
  var material  = new THREE.MeshBasicMaterial();
  material.map   = THREE.ImageUtils.loadTexture('starfield.png');
  material.side  = THREE.BackSide;
  // create the mesh based on geometry and material
  var mesh  = new THREE.Mesh(geometry, material);
  return mesh;
}

function SetPaths(){
  
}


function map( x,  in_min,  in_max,  out_min,  out_max){
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


Component.prototype.objectCreated = function() {
  this.getThreeRenderer().setClearColor(new THREE.Color(0x000000));
  // this.getThreeData() is available
//   sphere = CreateEarth(radius);
//   galaxy = CreateGalaxy();
  
  
//   this.getThreeScene().add(sphere);
//   this.getThreeScene().add(galaxy);
  
  var dataRecordIndex;
  
  for (dataRecordIndex in dataSet) {
    var dataRecord = dataSet[dataRecordIndex];
    var phiFrom = dataRecord.from.lat * Math.PI / 180;
    var thetaFrom = (dataRecord.from.lon + 90) * Math.PI / 180;

    //calculates "from" point
    var xF = radius * Math.cos(phiFrom) * Math.sin(thetaFrom);
    var yF = radius * Math.sin(phiFrom);
    var zF = radius * Math.cos(phiFrom) * Math.cos(thetaFrom);

    var phiTo   =  dataRecord.to.lat * Math.PI / 180;
    var thetaTo = (dataRecord.to.lon + 90) * Math.PI / 180;

    //calculates "to" point
    var xT = radius * Math.cos(phiTo) * Math.sin(thetaTo);
    var yT = radius * Math.sin(phiTo);
    var zT = radius * Math.cos(phiTo) * Math.cos(thetaTo);

      //Sets up vectors
      var vT = new THREE.Vector3(xT, yT, zT);
      var vF = new THREE.Vector3(xF, yF, zF);
    
    var dist = vF.distanceTo(vT);

    
    var cvT = vT.clone();
    var cvF = vF.clone();
    
    var xC = ( 0.5 * (vF.x + vT.x) );
    var yC = ( 0.5 * (vF.y + vT.y) );
    var zC = ( 0.5 * (vF.z + vT.z) );
   
    var mid = new THREE.Vector3(xC, yC, zC);
    
    var smoothDist = map(dist, 0, 10, 0, 15/dist );
    var dist2 = Math.pow(15/dist,2);
    
    mid.setLength( radius * smoothDist );
    
    cvT.add(mid);
    cvF.add(mid);
    
    cvT.setLength( radius * smoothDist );
    cvF.setLength( radius * smoothDist );
    
    //temp.normalize(); 
    
    //sets up control point vector and clamps it to prevent it fro becoming terribly big
    //var vC = new THREE.Vector3(temp.x * (radius + delta), temp.y * (radius + delta), temp.z * (radius + delta));
//     cvT.clamp( new THREE.Vector3(-5, -5, -5), new THREE.Vector3(5, 5, 5));
//     cvF.clamp( new THREE.Vector3(-5, -5, -5), new THREE.Vector3(5, 5, 5));
    
    //create the bezier curve
    var curve = new THREE.CubicBezierCurve3( vF, cvF, cvT, vT );

    var geometry2 = new THREE.Geometry();
    geometry2.vertices = curve.getPoints( 50 );

    var material2 = new THREE.LineBasicMaterial( { color : 0xff0000 } );

    // Create the final Object3d to add to the scene
    var curveObject = new THREE.Line( geometry2, material2 );
    paths.push(curve);
    this.getThreeScene().add(curveObject);
    
    
    var cylinderRadius = radius * 0.01;
    var cylinderHeight = radius / 500;
    
    //Create cylinder to reperesent "From" city
    var geometry = new THREE.CylinderGeometry( cylinderRadius, cylinderRadius, cylinderHeight, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
    var cylinderFrom = new THREE.Mesh( geometry, material );
    
    fromPoints.push(cylinderFrom);

    cylinderFrom.position.copy(vF);

    cylinderFrom.rotation.y = dataRecord.from.lon * Math.PI / 180;

    var xRotationSign = dataRecord.from.lon + 90 > 90 ? -1 : 1;
    cylinderFrom.rotation.x = xRotationSign * (90 - dataRecord.from.lat) * Math.PI / 180;
    
    this.getThreeScene().add( cylinderFrom );
    
    //Create cylinder to reperesent "To" city
    var cylinderTo = new THREE.Mesh( geometry, material );
    
    toPoints.push(cylinderTo);

    cylinderTo.position.copy(vT);

    cylinderTo.rotation.y = dataRecord.to.lon * Math.PI / 180;

    xRotationSign = dataRecord.to.lon + 90 > 90 ? -1 : 1;
    cylinderTo.rotation.x = xRotationSign * (90 - dataRecord.to.lat) * Math.PI / 180;
    
    this.getThreeScene().add( cylinderTo );
    
    //Create Shpere to follow along the path
    geometry  = new THREE.SphereGeometry(cylinderRadius * 2, 32, 32);
    material  = new THREE.MeshBasicMaterial( {color:0xff00000} );
    var sphere  = new THREE.Mesh(geometry, material);
    
    movingGuys.push(sphere);
    //gets the path first position
    sphere.position.copy(curve.getPoint(0));
    //this.getThreeScene().add(sphere);
    
  }
};

/**
 * Called per VeroldEngine update (once per frame)
 * @param  {float} delta The number of seconds since the last call to `update`
 */
var t = 0.1;
var pt = 0;
Component.prototype.update = function(delta) {
  var threeData;
  // since update can be called before the Three.JS data is present, you should always
  // check for its existence before making use of it
  if (this.hasThreeData()) {
    // It is safe to manipulate threeData now.
    threeData = this.getThreeData();
//     console.log(paths[0]);
    for( var i = 0; i < movingGuys.length; i ++ ) {
      pt = paths[i].getPoint( t );
      movingGuys[i].position.set( pt.x, pt.y, pt.z );
      
    }
      t = (t >= 1) ? 0 : t += 0.002;
  }
};

/**
 * Called when the VeroldEntity is unloaded or this component is removed
 */
Component.prototype.shutdown = function() {
  // make sure to clean up any events or other bindings that you have created
  // to avoid memory leaks
};

// =========================================================
// Life Cycle Events
// =========================================================
// preInit() - called as soon as the component is created. Note that the VeroldEntity hasn't been loaded yet and attribute values are not yet available.
// init() - called when the load of the VeroldEntity (that this component is attached to) has started. Attribute values are available and all VeroldEntities in the project are created
// shutdown() - called when the VeroldEntity is being unloaded
//
// The 'update' events are called every frame, followed by the 'render' events
// Each is passed 'delta' which is the time elapsed since the last frame, in seconds. i.e. at 60 fps, delta would be approximately 0.017 seconds.

// update( delta ) - main update. The should be used for updating application/game logic. 
// preUpdate(delta) - called immediately before all component 'update' functions are called.
// postUpdate(delta) - called immediately after all component 'update' functions are called.

// render(delta) - called once per frame, just after updates. This function can be used for any custom Three.JS rendering that you want to do. Note that if you want to access the current camera/scene being used to render by the engine, you may want to consider using pre/postRenderView instead (See below).
// preRender(delta) - called immediately before all component 'render' functions are called.
// postRender(delta) - called immediately after all component 'render' functions are called.

// These functions are triggered for each active camera in a scene (and so are potentially called multiple times a frame). You can use them to do custom pre/post passes. 'options' contains information about the render being done including viewport and clearing information.
// preRenderView( scene, camera, options ) - called just before a camera's view is rendered
// for a scene.
// postRenderView( scene, camera, options ) - called just after a camera's view is rendered
// for a scene.
//
// suspend() - called when application loses focus
// resume() - called when application regains focus
//
// objectCreated() - called when the VeroldEntity's Three.JS data is available (e.g. THREE.Object3D, THREE.Mesh, etc.)
// objectLoaded() - called when the Three.JS data is completely loaded,
//                  including it's children and dependencies (e.g. textures and materials)
// sceneLoaded() - called when the scene is fully loaded

return Component;