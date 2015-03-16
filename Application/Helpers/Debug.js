var App = App || {};

App.Debug = {

  addAxisHelper: function() { // adds axis to the globe

      //if (scope.axishelp === false) return;

      var axes = new THREE.AxisHelper(200);
      axes.position.set(0, 0, 0);
      globe.add(axes);

  },

  addStats : function() {

    stats = new Stats();
    stats.setMode(0); // 0: fps, 1: ms

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild(stats.domElement);

  }

}