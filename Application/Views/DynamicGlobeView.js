var Application = Application || {};

Application.DynamicGlobeView = Application.BaseGlobeView.extend({

    // framework methods

    initialize: function() {

        Application.BaseGlobeView.prototype.initialize.call(this);

        this.countries = [];
        this.particles = [];

        // TODO: review
        this.moved = false;
    },
    render: function() {

        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    },

    // member methods

    showGlobe: function() {

        Application.BaseGlobeView.prototype.showGlobe.call(this);
    },
    addGlobe: function() {

        Application.BaseGlobeView.prototype.addGlobe.call(this);

        this.countries.push(this.globe);
    },
    initGlobe: function() {

        Application.BaseGlobeView.prototype.initGlobe.call(this);

        this.getCountriesGeometry().done(this.onGotCountriesGeometry.bind(this));

// TODO: move out of this view
        function onMouseUp(e) {
            if (!this.moved) {
               this.clickOn(e);
            }
            this.moved = false;
        };

        function onMouseMove(e) {
            if (e.which == 1) {

                this.moved = true;
            }
        };

        document.addEventListener('mousemove', onMouseMove.bind(this), false);
        document.addEventListener('mouseup', onMouseUp.bind(this), false);

        $(document).on("keyup", 'form', function(e) {
        });

        $(document).on("keypress", function(e) {
        });

        $('#tweets').on("click", function(e) {
        });

        $('#reset').on("click", function(e) {
        });
    },
    renderGlobe: function() {

        Application.BaseGlobeView.prototype.renderGlobe.call(this);
    },
    updateGlobe: function() {
        
        if (this.orbitOn === true) {

            TWEEN.update();
        }
        Application.BaseGlobeView.prototype.updateGlobe.call(this);
    },
    addHelpers: function() {
        
        Application.BaseGlobeView.prototype.addHelpers.call(this);
        
        Application.Debug.addAxes(this.globe);
    },
    // TODO: move out of this view
    getCountriesGeometry: function() { 

        return $.ajax({
            type: 'GET',
            url: 'Models/geodata.json',
            dataType: 'json',
            cache: false, 
            error: function() {
                console.log('An error occurred while processing a countries file.');
            }
        });
    },
    onGotCountriesGeometry: function(data) {
        this.addCountries(data);
        this.startDataStreaming();
    },
    addCountries: function(data) {

        var i = 10;
        for (var countryName in data) {

            var countrycolor = Application.Helper.rgbToHex(10, i++, 0);
            var material = new THREE.MeshPhongMaterial({
                shininess: 0,
                color: countrycolor
            });

            var geometry = new Map3DGeometry(data[countryName], 0);
            var mesh = new THREE.Mesh(geometry, material);

            var scale = this.globeRadius + 0.5;
            mesh.scale.set(scale, scale, scale);
            mesh.geometry.computeBoundingSphere();

            this.scene.add(mesh);

            // see 'findCountryMeshByName'
            mesh.userData.countryName = countryName;

            this.countries.push(mesh);
        }
    },
    // TODO:
    // <script src="http://localhost:8080/socket.io/socket.io.js"></script>    
    startDataStreaming: function() {

        var obj = {};
        obj.track = "love";
        // obj.language = "en";

        var socket = io('http://localhost:8080');
        socket.on('tweet', this.didReceiveData.bind(this));

        socket.emit('start', obj);
    },
    didReceiveData: function(data) {

        console.log(data);

        var geometry = new THREE.SphereGeometry(1, 64, 64);
        var material = new THREE.MeshPhongMaterial({
                                color: 0xFF0000,
                                ambient: 0x4396E8,
                                shininess: 20
                            });
        var particle = new THREE.Mesh(geometry, material);

        var position = Application.Helper.geoToxyz(data.coordinates.coordinates[0], data.coordinates.coordinates[1], this.globeRadius);
        particle.position.set(position.x, position.y, position.z);

        this.scene.add(particle);

        this.particles.push(particle);
    },

    findCountryMeshByName: function(countryName) {

        for (var i = 0; i < this.countries.length; ++i) {

            if (this.countries[i].userData.countryName.toLowerCase() == countryName.toLowerCase()) {

                return this.countries[i];
            }
        }
    }, 
    clickOn: function(event) {

        var x = event.clientX;
        var y = event.clientY;

        x -= this.container.offsetLeft;
        y -= this.container.offsetTop;

        var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);
        vector.unproject(this.camera);

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
        var intersects = ray.intersectObjects(this.countries);
        if (intersects.length > 0) {

            if (intersects[0].object == this.globe) {
                return;
            }
            this.cameraGoTo(intersects[0].object);
        }
    },
    cameraGoTo: function(countryMesh) {

        // document.removeEventListener('mouseup', onMouseUp, false);
        // this.controls.removeMouse();
        
        this.moved = true;

        var current = this.controls.getPosition();
        var destination = countryMesh.geometry.boundingSphere.center.clone();
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