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

    intersects = this.raycaster.intersectObject( this.pointcloud );
    if ( intersects.length > 0 ) {
      var index = intersects[0].index;
      console.log("Value= ", this.attributes.x.value[index] + "," + this.attributes.y.value[index] + "," + this.attributes.z.value[index]);
    }


  },
  destroy: function() {

      this.yz.material.dispose();
      this.yz.geometry.dispose();
      this.yz = null;

      this.xy.material.dispose();
      this.xy.geometry.dispose();
      this.xy = null;

      this.xz.material.dispose();
      this.xz.geometry.dispose();
      this.xz = null;

      this.gridHelper1.material.dispose;
      this.gridHelper1.material.dispose;
      this.gridHelper1 = null;

      this.gridHelper2.material.dispose;
      this.gridHelper2.material.dispose;
      this.gridHelper2 = null;

      this.gridHelper3.material.dispose;
      this.gridHelper3.material.dispose;
      this.gridHelper3 = null;

      Application.BaseView.prototype.destroy.call(this);
  },
  init: function() {
      Application.BaseView.prototype.init.call(this);
  },
  addScene: function(){
      this.addGrids();
  },
  addGrids: function() {
      var geometry = new THREE.PlaneGeometry( 60, 60, 1 );
      var mtYZ = new THREE.MeshBasicMaterial( {color: 0x0000ff, transparent:true, side: THREE.DoubleSide, opacity: 0.4} );
      var mtXY = new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent:true, side: THREE.DoubleSide, opacity: 0.4} );
      var mtXZ = new THREE.MeshBasicMaterial( {color: 0xff0000, transparent:true, side: THREE.DoubleSide, opacity: 0.4} );

      this.yz = new THREE.Mesh( geometry, mtYZ );
      this.xy = new THREE.Mesh( geometry, mtXY );
      this.xz = new THREE.Mesh( geometry, mtXZ );

      this.yz.position.z = -60;
      this.xy.rotation.x = 90*(Math.PI/180);
      this.xy.position.y = -60;
      this.xz.rotation.y = 90*(Math.PI/180);
      this.xz.position.x = -60;

      // this.scene.add(this.yz);
      // this.scene.add(this.xy);
      // this.scene.add(this.xz);

      // Application.Debug.addAxes(this.scene);

      var size = 60;
      var step = 40;

      this.gridHelper1 = new THREE.GridHelper( size, step );
      this.gridHelper2 = new THREE.GridHelper( size, step );
      this.gridHelper3 = new THREE.GridHelper( size, step );

      this.gridHelper1.rotation.x = 90*(Math.PI/180);
      this.gridHelper2.rotation.y = 90*(Math.PI/180);
      this.gridHelper3.rotation.z = 90*(Math.PI/180);

      // this.scene.add( this.gridHelper1 );
      // this.scene.add( this.gridHelper2 );
      // this.scene.add( this.gridHelper3 );


      //TODO templorary solution
      Application._vent.trigger('globe/ready');
  }
});
