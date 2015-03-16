var App = App || {};

App.Helper = {

  drawGlobe : function(){ // draw a globe

    // Dima version =================================
    var geometry = new THREE.SphereGeometry(50, 64, 64);
    var material = new THREE.MeshPhongMaterial({
        color: 0x4396E8,
        ambient: 0x4396E8,
        shininess: 20
    });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    globe.userData.name = 'globe';
    globe.userData.code = '';
    countries.push(globe);

    // Bruno ========================================
    var geometry = new THREE.SphereGeometry(radius, 64, 32);
    var texture = THREE.ImageUtils.loadTexture( tex );
    // texture.needsUpdate    = true;
    var material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        ambient: 0xFFFFFF,
        map: texture,
        // specularMap: texture,
        // shininess: 50,
    });
    globe = new THREE.Mesh(geometry, material);
    globe.material.needsUpdate = true;
    scene.add(globe);
    setUpCanvas(hexMap);
    console.log(globe);

  },

  addCamera : function(){
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

    // Dima version
    camera.position.z = 100;

    // Bruno version
    camera.position.z = radius * 4;

    if (pos) {
        camera.position.z = pos.z;
        camera.position.y = pos.y;
        camera.position.x = pos.x;
    }
    scene.add(camera);
  },

  addLight : function(){

    // Dima  ====================================================
    //var ambLight = new THREE.AmbientLight(0xFFFFFF);
    var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    dirLight.position.set(-100, 100, 100);
    dirLight.target = globe;

    // scene.add(ambLight);
    camera.add(dirLight);

    // Bruno ====================================================
    var ambLight = new THREE.AmbientLight(0xFFFFFF, 2.5);
    var dirLight = new THREE.DirectionalLight(0xFFFFFF, 2.5);
    dirLight.position.set(-10, 10, 10);
    dirLight.target = globe;

    scene.add(ambLight);
    // camera.add(dirLight);

  },

  addStats : function() {

    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);

  },

  addAxisHelper: function() { // adds axis to the globe

      //if (scope.axishelp === false) return;

      var axes = new THREE.AxisHelper(200);
      axes.position.set(0, 0, 0);
      globe.add(axes);

  },

  /**
   * Controller kind of methods
   */
  onWindowResize : function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  //TODO
  //window.addEventListener('resize', onWindowResize, false);

  addControls : function(){

    controls = new THREE.OrbitControls(camera, container);

    //Dima
    controls.minDistance = 55;
    controls.maxDistance = 150;
    //Bruno
    controls.minDistance = radius * 1.1;
    controls.maxDistance = radius * 7;

    controls.userPan = false;

  },

  cameraGoTo : function( c ) {

    // Dima version ============================================================
    container.removeEventListener('mouseup', onMouseUp, false);
    moved = true;
    controls.removeMouse();

    var countrymesh = findCountryMeshByName(countryname);

    if (countrymesh === undefined) {

        $('.country').empty();
        $('.country').append("Not found");
        return;

    }

    var current = controls.getPosition();

    //   for (var i = 0; i < countries.length; i++) {

    //   if (countries[i].name == country) {

    //var midpoint = getMidPoint( geodata[ countryname] );
    //var destination =  geoToxyz( midpoint.lon, midpoint.lat );
    // var destination = geoToxyz(camerapoints[i].lon, camerapoints[i].lat);
    // var countrymesh = findCountryMeshByName( countryname );
    var destination = countrymesh.geometry.boundingSphere.center.clone();
    destination.setLength(controls.getRadius());
    //     break;
    //  }

    //  }
    highlightCountry(countrymesh);

    //    console.dir( current, destination );

    if (orbitOn == true) {
        tween.stop();
    }

    tween = new TWEEN.Tween(current)
        .to({
            x: destination.x,
            y: destination.y,
            z: destination.z
        }, 1000)

    .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate(function() {

            controls.updateView({
                x: this.x,
                y: this.y,
                z: this.z
            });

        })
        .onComplete(function() {
            orbitOn = false;
            container.addEventListener('mouseup', onMouseUp, false);
            controls.addMouse();
        });

    orbitOn = true;
    tween.start();

    // Bruno ==================================================
    var current = controls.getPosition();
    var country = c;
    if(country){
      var destination = new THREE.Vector3(country.midPoint.x, country.midPoint.y, -1 * country.midPoint.z);
      console.log(country);

      destination.setLength( ( radius * 2 ) );

      // console.dir( current, destination );

      if (orbitOn == true) {
          tween.stop();
      }

      tween = new TWEEN.Tween(current)
          .to({
              x: destination.x,
              y: destination.y,
              z: destination.z
          }, 1000)

      .easing(TWEEN.Easing.Sinusoidal.InOut)
          .onUpdate(function() {

              controls.updateView({
                  x: this.x,
                  y: this.y,
                  z: this.z
              });

          })
          .onComplete(function() {
              orbitOn = false;
              console.log("stop");
          });

      orbitOn = true;
      tween.start();
    }
  },

  clickOn : function(event) { // function that determines intersection with meshes

    var x = event.clientX;
    var y = event.clientY;

    x -= container.offsetLeft;
    y -= container.offsetTop;

    var vector = new THREE.Vector3((x / container.offsetWidth) * 2 - 1, -(y / container.offsetHeight) * 2 + 1, 0.5);

    vector.unproject(camera);

    var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects = ray.intersectObjects(countries); // returns an object in any intersected on click

    //Dima's version===============================
    if (intersects.length > 0) {
        if (intersects[0].object.userData.name == 'globe') return; // exclude invisible meshes from intersection
        cameraGoTo(intersects[0].object.userData.name);
    }

    //Bruno ========================================
    //
    if (intersects.length > 0) {
        if (intersects[0].object.name == 'globe') return; // exclude invisible meshes from intersection
        var place = intersects[0].point;
        place.setLength(radius);
        var color = getPixelClicked(place, canvasCtx)
        var country = getCountryById(color);
        cameraGoTo(country);
    }

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