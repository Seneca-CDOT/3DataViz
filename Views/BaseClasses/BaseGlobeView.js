var Application = Application || {};

Application.BaseGlobeView = Application.BaseView.extend({
    tagName: "div",
    id: 'baseGlobe',
    template: _.template($("#globeViewTemplate").html()),
    events: {

        'mousemove': 'onMouseMove',
        'mouseup': 'onMouseUp'
    },
    destroy: function() {

        for (var i = 0; i < this.decorators.length; ++i) {
            this.decorators[i].destroy(this);
        }
        this.decorators = null;

        this.stars.material.dispose();
        this.stars.geometry.dispose();
        this.stars = null;

        this.globe.material.dispose();
        this.globe.geometry.dispose();
        this.globe = null;

        Application.BaseView.prototype.destroy.call(this);
    },
    init: function() {
        Application.BaseView.prototype.init.call(this);
    },
    addLight: function() {

        // var ambLight = new THREE.AmbientLight(0xFFFFFF);
        var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        dirLight.position.set(-1000, 1000, 1000);
        dirLight.target = this.globe;

        // this.scene.add(ambLight);
        this.camera.add(dirLight);
    },
    addScene: function(){
        this.addGlobe();
        this.addStars();
    },
    addGlobe: function() {

        var geometry = new THREE.SphereGeometry(this.globeRadius, 64, 64, 90 * (Math.PI / 180));
        var material = new THREE.MeshPhongMaterial({
            color: 0x4396E8,
            ambient: 0x4396E8,
            shininess: 20
        });
        this.globe = new THREE.Mesh(geometry, material);

        this.scene.add(this.globe);
        this.rayCatchers.push(this.globe);
    },
    addStars: function() {

        var geometry = new THREE.SphereGeometry(200, 32, 32);
        var material = new THREE.MeshBasicMaterial();
        material.map = THREE.ImageUtils.loadTexture('Assets/images/galaxy_starfield.png');
        material.side = THREE.BackSide;
        this.stars = new THREE.Mesh(geometry, material);
        this.scene.add(this.stars);
    }
});
