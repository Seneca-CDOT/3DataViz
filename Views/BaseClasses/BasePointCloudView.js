var Application = Application || {};

Application.BasePointCloudView = Application.BaseView.extend({
  tagName: "div",
  id: "basePointCloud",
  onMouseMove: function(e) {
    e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;

    x -= this.container.offsetLeft;
    y -= this.container.offsetTop;

    var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);
    vector.unproject(this.camera);
    this.raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

    intersects = this.raycaster.intersectObjects( this.pointclouds );

    if ( intersects.length > 0 ) {
      var results = this.collection[0].models;
      var index = intersects[0].index;
      var value = intersects[0].object.userData.values[index];
      if (value && intersects[0].object.visible) {
        clearTimeout(this.timer);
        this.timer = setTimeout(function(){
            Application._vent.trigger('vizinfocenter/message/off');
            clearTimeout(this.timer);
            this.timer = null;
        }, 3000);
        Application._vent.trigger('vizinfocenter/message/on', value);
      }
    }else{
    }
  },
  showResults: function(results){
    Application.BaseView.prototype.showResults.call(this, results);
  },
  destroy: function() {
      Application.BaseView.prototype.destroy.call(this);
  },
  // addCamera: function() {
  //
  //     var width = this.options.size.width - this.offset;
  //     var height = this.options.size.height;
  //     this.camera = new THREE.OrthographicCamera(width / - 16, width / 16, height / 16, height / - 16, 1, 1000);
  //
  //     if (this.options.position) {
  //
  //         this.camera.position.x = this.options.position.x;
  //         this.camera.position.y = this.options.position.y;
  //         this.camera.position.z = this.options.position.z;
  //     } else {
  //
  //         this.camera.position.z = 100;
  //     }
  //
  //     this.scene.add(this.camera);
  // },
  onWindowResize: function() {

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
