var Application = Application || {};

Application.BaseGlobeView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#globeViewTemplate").html()),
    events: {

        'mousemove': 'onMouseMove',
        'mouseup': 'onMouseUp'
    },

    // framework methods
    initialize: function() {
        this.container = this.$el[0];

        this.rayCatchers = [];
    
        // TODO: review
        this.moved = false;
        this.orbitOn = false;

        // represents user mouse idle
        this.idle = true;
        // represents timer for user mouse idle
        this.timer; 

        this.globeRadius = 50;
    },
    destroy: function() {

        this.collection.reset();
    },
    render: function() {

        this.showGlobe();
        return this;
    },

    // member methods
    onMouseUp: function(e) {

        if (!this.moved) {

            this.clickOn(e);
        }
        this.moved = false;
    },
    onMouseMove: function(e) {

        if (e.which == 1) {

            this.moved = true;
        }

        function setTimer() {

            this.idle = false;

            clearTimeout(this.timer);

            var that = this;
            this.timer = setTimeout(function() {

                that.idle = true
            }, 5000);
        }
        // TODO: fix issue with particles then uncomment
        // setTimer.call(this);
    },
    showGlobe: function() {

        this.initGlobe();
    },
    initGlobe: function() {

        this.addSceneAndRenderer();
        this.addCamera();
        this.addGlobe();
        this.addLight();
        this.addControls();

        this.addHelpers();

        // TODO: move out of this view
        // ---        
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        // ---

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
    addCamera: function() {

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

        var geometry = new THREE.SphereGeometry(this.globeRadius, 64, 64);
        var material = new THREE.MeshPhongMaterial({
            color: 0x4396E8,
            ambient: 0x4396E8,
            shininess: 20
        });
        this.globe = new THREE.Mesh(geometry, material);

        this.scene.add(this.globe);
        this.rayCatchers.push(this.globe);
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

        requestAnimationFrame(this.renderGlobe.bind(this));

        Application.Debug.stats.begin();
        this.updateGlobe();
        this.renderer.render(this.scene, this.camera);
        Application.Debug.stats.end();
    },
    updateGlobe: function() {

        this.controls.update();

        if (this.orbitOn === true) {
             
            TWEEN.update();
        }

        // TODO: fix issue with particles then uncomment
        // if (this.idle === true) {

        //     this.globe.rotation.y -= 0.0003;
        // }
    },
    addControls: function() {

        this.controls = new THREE.OrbitControls(this.camera, this.container);
        this.controls.minDistance = 55;
        this.controls.maxDistance = 150;
        this.controls.userPan = false;
    },
    addHelpers: function() {
        Application.Debug.addStats();
    },

    // TODO: move out of this view
    onWindowResize: function() {

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    // interaction
    clickOn: function(event) {

        var x = event.clientX;
        var y = event.clientY;

        x -= this.container.offsetLeft;
        y -= this.container.offsetTop;

        var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);
        vector.unproject(this.camera);

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
        var intersects = ray.intersectObjects(this.rayCatchers);

        if (intersects.length > 0) {

            var closestMesh = intersects[0].object;
            if (closestMesh !== this.globe) {
                
                this.cameraGoTo(closestMesh);
            }
        }
    },
    cameraGoTo: function(mesh) {

        // document.removeEventListener('mouseup', onMouseUp, false);
        // this.controls.removeMouse();
        
        this.moved = true;

        var current = this.controls.getPosition();
        var destination = mesh.geometry.boundingSphere.center.clone();
        destination.setLength(this.controls.getRadius());

        if (this.orbitOn == true) {

            this.tween.stop();
        }

        this.tween = new TWEEN.Tween(current)
        .to({
            x: destination.x,
            y: destination.y,
            z: destination.z
        }, 1000)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onUpdate((function(that) { 

            return function () { 

                onUpdate(this, that); 
            };
        })(this))
        .onComplete((function(that) { 

            return function () { 

                onComplete(this, that); 
            };
        })(this));

        function onUpdate(point, that) {

            that.controls.updateView({

                x: point.x,
                y: point.y,
                z: point.z
            });
        }

        function onComplete(point, that) {

            that.orbitOn = false;
            // document.addEventListener('mouseup', onMouseUp, false);
            // this.controls.addMouse();
        }

        this.orbitOn = true;
        this.tween.start();
    }
});