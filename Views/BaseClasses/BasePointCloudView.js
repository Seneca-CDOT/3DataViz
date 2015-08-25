var Application = Application || {};

Application.BasePointCloudView = Application.BaseView.extend({
  tagName: "div",
  id: "basePointCloud",
  initialize: function(decorator, collections){
    Application.BaseView.prototype.initialize.call(this, decorator, collections);

    this.cameraId = 0;
    this.zoom = 1;
    Application._vent.on('controlpanel/camerasnap', this.cameraSnap, this);
    Application._vent.on('controlpanel/camerachange', this.cameraChange, this);
  },
  showResults: function(results){
    Application.BaseView.prototype.showResults.call(this, results);
    Application._vent.trigger('controlpanel/cameraswitcher');
  },
  destroy: function() {
      Application.BaseView.prototype.destroy.call(this);
      Application._vent.unbind('controlpanel/camerasnap', this.cameraSnap);
      Application._vent.unbind('controlpanel/camerachange', this.cameraChange);
  },
  addCamera: function() {

      var width = this.options.size.width - this.offset;
      var height = this.options.size.height;
      // this.camera = new THREE.OrthographicCamera(width / - 16, width / 16, height / 16, height / - 16, 1, 1000);
      this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);

      if (this.options.position) {

          this.camera.position.x = this.options.position.x;
          this.camera.position.y = this.options.position.y;
          this.camera.position.z = this.options.position.z;
      } else {

          this.camera.position.z = 100;
      }

      this.scene.add(this.camera);
  },
  switchCamera: function(cameraId){

    if(this.cameraId != cameraId){
      var width = this.options.size.width - this.offset;
      var height = this.options.size.height;
      var rotation = this.camera.rotation;
      var position = this.camera.position;

      switch(cameraId){
        case 0:
          this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
          this.addControls();
          this.controls.useOrthographicCamera = false;
          break;
        case 1:
          this.camera = new THREE.OrthographicCamera(width / - 8, width / 8, height / 8, height / - 8, 1, 1000);
          this.camera.zoom = this.zoom;
          this.camera.updateProjectionMatrix();
          this.addControls();
          this.controls.useOrthographicCamera = true;
          break;
      }
      this.camera.rotation.x = rotation.x;
      this.camera.rotation.y = rotation.y;
      this.camera.rotation.z = rotation.z;

      this.camera.position.x = position.x;
      this.camera.position.y = position.y;
      this.camera.position.z = position.z;

      this.cameraId = cameraId;
    }

  },
  cameraChange: function(cameraId){
    this.switchCamera(cameraId);
  },
  cameraSnap: function(obj){
    this.cameraGoTo(obj.cameraPos);
  },
  onMouseMove: function(e) {
    e.preventDefault();

    this.raycaster= new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    mouse.x = ( e.clientX / this.container.offsetWidth ) * 2 - 1;
    mouse.y = - ( e.clientY / this.container.offsetHeight ) * 2 + 1;
    this.raycaster.setFromCamera(mouse, this.camera);

    var intersects = this.raycaster.intersectObjects( this.pointclouds );

    if ( intersects.length > 0 ) {
      var results = this.collection[0].models;
      var index = intersects[0].index;
      var value = intersects[0].object.userData.values[index];
      var x = intersects[0].object.userData.x[index];
      var y = intersects[0].object.userData.y[index];
      var z = intersects[0].object.userData.z[index];

      if ( (value || x || y || z) && intersects[0].object.visible) {
        clearTimeout(this.timer);
        this.timer = setTimeout(function(){
            Application._vent.trigger('vizinfocenter/message/off');
            clearTimeout(this.timer);
            this.timer = null;
        }, 3000);

        var msg = "";
        if(value){
          msg += (value+"<br>");
        }
        if(x && y && z){
          msg += "(" +Application.attrsMap['x']+ ":" +x+ ", "+Application.attrsMap['y']+ ":" +y+ ",  "+Application.attrsMap['z']+": "+z+")";
        }
        Application._vent.trigger('vizinfocenter/message/on', msg);
      }
    }

  },
  onWindowResize: function() {

  },
  updateScene: function() {

      Application.BaseView.prototype.updateScene.call(this);
      this.zoom += this.controls.zoomStart;
      if(this.cameraId === 1){
        this.camera.zoom = this.zoom;
        this.camera.updateProjectionMatrix();
      }

  },
  init: function() {
      Application.BaseView.prototype.init.call(this);
  },
  addScene: function(){
      this.addGrids();
  },
  addGrids: function() {

      var lineGeometry = new THREE.Geometry();
      for (var j=0; j<5; j++) {
        lineGeometry.vertices.push(new THREE.Vector3( -30, (j*15)-30, -30));
        lineGeometry.vertices.push(new THREE.Vector3( 30, (j*15)-30, -30));
        lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, 30, -30));
        lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, -30, -30));

        lineGeometry.vertices.push(new THREE.Vector3( -30, -30, (j*15)-30));
        lineGeometry.vertices.push(new THREE.Vector3( 30, -30, (j*15)-30));
        lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, -30, 30));
        lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, -30, -30));

        lineGeometry.vertices.push(new THREE.Vector3(-30, -30, (j*15)-30));
        lineGeometry.vertices.push(new THREE.Vector3(-30, 30, (j*15)-30));
        lineGeometry.vertices.push(new THREE.Vector3(-30, (j*15)-30, 30));
        lineGeometry.vertices.push(new THREE.Vector3(-30, (j*15)-30, -30));
      }

      var lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          linewidth: 0.5, // will always be 1 on windows
          opacity: 0.5,
          transparent: true,
      });
      this.lineMesh =  new THREE.Line(lineGeometry, lineMaterial, THREE.LinePieces);
      this.scene.add(this.lineMesh);

      //TODO templorary solution
      Application._vent.trigger('globe/ready');
  }
});
