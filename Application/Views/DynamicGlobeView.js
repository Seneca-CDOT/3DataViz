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
    },
    initGlobe: function() {

        Application.BaseGlobeView.prototype.initGlobe.call(this);

        this.getCountriesGeometry().done(this.onCountriesGeometryGet.bind(this));

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

        this.updateParticles();
    },
    updateParticles: function() {

        var time = Date.now() * 0.001;

        for(var i = 0; i < this.particles.length; ++i) {
            var rotation = 2 * Math.PI * Math.sin(0.5 * i + time)
            this.particles[i].rotation.z = rotation;

            var scale = 2 + Math.sin(0.5 * i + time);
            this.particles[i].scale.set(scale, scale, scale);
        }
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
    onCountriesGeometryGet: function(data) {
        this.addCountries(data);
        this.startDataStreaming();
    },
    addCountries: function(data) {

        var green = 1;
        for (var countryName in data) {

            green = (2 * green) % 100;

            var countryColor = Application.Helper.rgbToHex(10, 50 + green, 0);
            var material = new THREE.MeshPhongMaterial({
                shininess: 0,
                color: countryColor
            });

            var geometry = new Map3DGeometry(data[countryName], 0);
            var mesh = new THREE.Mesh(geometry, material);

            var scale = this.globeRadius + 0.5;
            mesh.scale.set(scale, scale, scale);
            mesh.geometry.computeBoundingSphere();

            this.scene.add(mesh);
            this.countries.push(mesh);
        }

        // TODO: review
        this.countries.push(this.globe);
    },
    // TODO: move to model
    // <script src="http://localhost:8080/socket.io/socket.io.js"></script>    
    startDataStreaming: function() {
        
        var obj = {};
        // obj.track = "morning";
        obj.track = "love";
        // obj.language = "en";

        var socket = io('http://localhost:8080');
        socket.on('tweet', this.onDataReceive.bind(this));
        // socket.off('tweet', ...);

        socket.emit('start', obj); 
    },
    onDataReceive: function(data) {

        console.log(data);

        var dataRecord = new Application.GeoDataRecord();
        dataRecord.longitude = data.coordinates.coordinates[0];
        dataRecord.latitude = data.coordinates.coordinates[1];
        dataRecord.timestamp = data.timestamp_ms;

        this.addParticleWithDataRecord(dataRecord);
        this.removeParticleIfNeeded();
    },
    addParticleWithDataRecord: function(dataRecord) {

        // TODO: encapsulate paticle

        // sphere
        // var geometry = new THREE.SphereGeometry(0.5, 64, 64);
        // var material = new THREE.MeshPhongMaterial({
        //                         color: 0xFF0000,
        //                         ambient: 0x4396E8,
        //                         shininess: 20
        //                     });

        // sphere cube
        var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        var material = new THREE.MeshBasicMaterial({ 
                                    color: 0xFF0000, 
                                    wireframe: true 
                                });

        var particle = new THREE.Mesh(geometry, material);


        var position = Application.Helper.geoToxyz(dataRecord.longitude, dataRecord.latitude, this.globeRadius);

        // compute orientation parameters
        var objectNormal = new THREE.Vector3(0, 0, 1);

        var direction = new THREE.Vector3(position.x, position.y, position.z);
        direction.normalize();

        var angle = Math.acos(direction.z);
        var axis = new THREE.Vector3();
        axis.crossVectors(objectNormal, direction);
        axis.normalize();

        var quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

        // set orientation parameters
        particle.rotation.setFromQuaternion(quaternion);direction
        var displacement = 1.04 * this.globeRadius;
        particle.position.set(direction.x * displacement, direction.y * displacement, direction.z * displacement);

        // Application.Debug.addAxes(particle);

        this.scene.add(particle);
        this.particles.push(particle);
    },
    removeParticleIfNeeded: function() {
        var count = this.particles.length;
        if (count > 100) {
            var particlesToRemove = this.particles.splice(0, count - 100);
            for (var i = 0; i < particlesToRemove.length; ++i) {
                this.scene.remove(particlesToRemove[i]);
            }
        }
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
        var intersects = ray.intersectObjects(this.countries);
        if (intersects.length > 0) {

            var closestMesh = intersects[0].object;
            if (closestMesh !== this.globe) {

                this.cameraGoTo(closestMesh);
            }
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