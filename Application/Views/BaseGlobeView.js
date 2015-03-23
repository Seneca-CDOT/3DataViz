var Application = Application || {};

Application.BaseGlobeView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#globeViewTemplate").html()),

    // framework methods

    initialize: function() {
        this.container = this.$el[0];
    
        // TODO: review
        this.orbitOn = false;
    },
    render: function(options) {
        this.showGlobe();
        return this;
    },

    // member methods

    showGlobe: function() {
       this.initGlobe(); 
    },
    initGlobe: function() {

        this.addSceneAndRenderer();
        this.addCamera();
        this.addGlobe();
        this.addLight();

        this.addControls();

        Application.Debug.addStats();
        Application.Debug.addAxes(this.globe);

// TODO: move out of this view        
        window.addEventListener('resize', this.onWindowResize.bind(this), false);

        this.renderGlobe();
    },
    addSceneAndRenderer: function() {

            this.scene = new THREE.Scene();
            this.renderer = new THREE.WebGLRenderer({
                                antialias: true,
                                alpha: true
                            });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setClearColor(0x000000);

            var width = this.options.size.width;
            var height = this.options.size.height;
            this.renderer.setSize(width, height);

            this.container.appendChild(this.renderer.domElement);
            this.container.style.position = "absolute";
            this.container.style.width = this.options.size.width;
            this.container.style.left = this.options.origin.x;

// TODO: move out of this view  
//          $(document.body).append('<form><input type="text" id="country" ' + 'style="position:absolute;top:50px;right:50px;font-size:30px;opacity:0.7;"></form>');
//          $(document.body).append('<button type="button" id="tweets" style="position:absolute;bottom:100px;right:50px;width: 200px;height: 50px">Tweets</button>');
//          $(document.body).append('<button type="button" id="reset" style="position:absolute;bottom:50px;right:50px;width: 200px;height: 50px">Reset</button>');
    },
    addCamera: function () {

        var width = this.options.size.width;
        var height = this.options.size.height;
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
    addGlobe: function() {

        var geometry = new THREE.SphereGeometry(50, 64, 64);
        var material = new THREE.MeshPhongMaterial({
                                color: 0x4396E8,
                                ambient: 0x4396E8,
                                shininess: 20
                            });
        this.globe = new THREE.Mesh(geometry, material);

        // TODO: review
        this.globe.userData.name = 'globe';
        this.globe.userData.code = '';

        this.scene.add(this.globe);
    },
    addLight: function() {

        // var ambLight = new THREE.AmbientLight(0xFFFFFF);
        var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        dirLight.position.set(-100, 100, 100);
        dirLight.target = this.globe;

        // scene.add(ambLight);
        this.camera.add(dirLight);
    },
    renderGlobe: function() {

        Application.Debug.stats.begin();
        this.controls.update();
        Application.Debug.stats.end();

        this.renderer.render(this.scene, this.camera);
    },
    addControls: function() {

        this.controls = new THREE.OrbitControls(this.camera, this.container);
        this.controls.minDistance = 55;
        this.controls.maxDistance = 150;
        this.controls.userPan = false;
    },
    
// TODO: move out of this view
    onWindowResize: function() {

          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
});