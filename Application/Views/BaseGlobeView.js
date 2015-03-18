var App = App || {};

App.BaseGlobeView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#globeViewTemplate").html()),

    // framework methods

    initialize: function() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
                                antialias: true,
                                alpha: true
                            });
        this.container = this.$el[0];
        // this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
        // this.globe = new THREE.Mesh(geometry, material);

        // TODO: move out of this view
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

        this.init();

        this.addCamera();
        this.drawGlobe();

        this.addLight();

        this.addStats();
        this.addAxisHelper();
        this.addControls();
    },

// *************************

    //   function onWindowResize() {

    //           camera.aspect = window.innerWidth / window.innerHeight;
    //           camera.updateProjectionMatrix();
    //           renderer.setSize(window.innerWidth, window.innerHeight);
    //   }
    //   window.addEventListener('resize', onWindowResize, false);

// *************************

    init: function() {

            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setClearColor(0x000000);

            var width = this.options.size.width;
            var height = this.options.size.height;
            this.renderer.setSize(width, height);

            this.container.appendChild(this.renderer.domElement);
            this.container.style.position = "absolute";
            this.container.style.width = this.options.size.width;
            this.container.style.left = this.options.origin.x;

//          $(document.body).append('<form><input type="text" id="country" ' + 'style="position:absolute;top:50px;right:50px;font-size:30px;opacity:0.7;"></form>');
//          $(document.body).append('<button type="button" id="tweets" style="position:absolute;bottom:100px;right:50px;width: 200px;height: 50px">Tweets</button>');
//          $(document.body).append('<button type="button" id="reset" style="position:absolute;bottom:50px;right:50px;width: 200px;height: 50px">Reset</button>');
    },

// *************************

    addCamera: function () {

        var width = this.options.size.width;
        var height = this.options.size.height;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);

        this.camera.position.z = 100;
        if (this.options.position) {

            this.camera.position.z = pos.z;
            this.camera.position.y = pos.y;
            this.camera.position.x = pos.x;
        }
        this.scene.add(this.camera);
    },
    drawGlobe: function() {

        var geometry = new THREE.SphereGeometry(50, 64, 64);
        var material = new THREE.MeshPhongMaterial({
                                color: 0x4396E8,
                                ambient: 0x4396E8,
                                shininess: 20
                            });
        this.globe = new THREE.Mesh(geometry, material);

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

// *************************

    renderGlobe: function() {
        requestAnimationFrame(this.renderGlobe.bind(this));

        this.stats.begin();
        if (this.orbitOn === true) {

            TWEEN.update();
        }
        this.controls.update();
        this.stats.end();

        this.renderer.render(this.scene, this.camera);
    },

// *************************

    addStats: function() {

        this.stats = new Stats();
        this.stats.setMode(0); // 0: fps, 1: ms 

        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.top = '0px';

        // TODO: move out of this view
        document.body.appendChild(this.stats.domElement);
    },
    addAxisHelper: function() { 

        var axes = new THREE.AxisHelper(200);
        axes.position.set(0, 0, 0);
        this.globe.add(axes);
    },
    addControls: function() {

        this.controls = new THREE.OrbitControls(this.camera, this.container);
        this.controls.minDistance = 55;
        this.controls.maxDistance = 150;
        this.controls.userPan = false;
    }

// *************************
});