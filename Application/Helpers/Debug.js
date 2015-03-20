var Application = Application || {};

Application.Debug = {

  addAxes: function(mesh) { 

      var axes = new THREE.AxisHelper(200);
      axes.position.set(0, 0, 0);
      mesh.add(axes);
  },

  addStats: function() {

    if (this.stats) {
      return;
    }

    this.stats = new Stats();
    this.stats.setMode(0); // 0: fps, 1: ms

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.stats.domElement.style.top = '0px';

    document.body.appendChild(this.stats.domElement);
  }

}