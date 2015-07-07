var Application = Application || {};

Application.BasePointCloudView = Application.BaseView.extend({
  tagName: "div",
  id: "basePointCloud",
  suscribe: function() {
    console.log("suscribe data/ready");
    Application._vent.on('data/ready', this.showResults, this);
  },
  showResult:function(){
    console.log("BasePointCloudView showResults");
  },
  onMouseMove: function(e) {
    e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;

    x -= this.container.offsetLeft;
    y -= this.container.offsetTop;

    var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);
    vector.unproject(this.camera);
    this.raycaster = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
  
  },
  renderScene: function() {

    if(this.raycaster != null){
      
      intersects = this.raycaster.intersectObject( this.pointcloud );

      if ( intersects.length > 0 ) {
        var index = intersects[0].index;
        console.log("Value= ", this.attributes.x.value[index] + "," + this.attributes.y.value[index] + "," + this.attributes.z.value[index]);
      }

    }

    this.requestedAnimationFrameId = requestAnimationFrame(this.renderScene.bind(this));
    Application.Debug.stats.begin();
    this.updateGlobe();
    this.renderer.render(this.scene, this.camera);
    Application.Debug.stats.end();

  }
});