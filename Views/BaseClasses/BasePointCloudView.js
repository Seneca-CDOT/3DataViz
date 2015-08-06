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
      var results = this.collection[0].models;
      var index = intersects[0].index;
      if (results[index].value) {
        clearTimeout(this.timer);
        this.timer = setTimeout(function(){
            Application._vent.trigger('vizinfocenter/message/off');
            clearTimeout(this.timer);
            this.timer = null;
        }, 3000);
        Application._vent.trigger('vizinfocenter/message/on', results[index].value);
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
  init: function() {
      Application.BaseView.prototype.init.call(this);
  },
  addScene: function(){
      this.addGrids();
  },
  addGrids: function() {

      //TODO templorary solution
      Application._vent.trigger('globe/ready');
  }
});
