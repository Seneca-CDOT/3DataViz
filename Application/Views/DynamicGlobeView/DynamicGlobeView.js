var Application = Application || {};

Application.DynamicGlobeView = Application.BaseGlobeView.extend({

    // framework methods

    initialize: function() {

        Application.BaseGlobeView.prototype.initialize.call(this);

        this.countries = [];

        this.particles = new Application.DataStructures.List();
        this.particlesToRemove = new Application.DataStructures.List();

        // TODO: review
        this.moved = false;

        // amimation
        this.timePeriod = 0;
        this.timePeriodMax = 100;
        this.delta = 0.05
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
        this.removeParticleIfNeeded();

        ++this.timePeriod;
        if (this.timePeriod > this.timePeriodMax) {
            this.timePeriod = 0;
        }
        var ratio = this.timePeriod / this.timePeriodMax;

        var iterator = this.particles.getBegin();
        while (iterator !== this.particles.getEnd()) {

            var particle = iterator.getData();

            var rotation = 2 * Math.PI * ratio;
            particle.getMesh().rotation.z = rotation;

            var scale = particle.getMesh().scale.x; // x, y, z are equal
            if (scale < 2.5) {
                scale += this.delta;
                particle.getMesh().scale.set(scale, scale, scale);
            }

            iterator = iterator.getNext();
        }

        iterator = this.particlesToRemove.getBegin();
        while (iterator !== this.particlesToRemove.getEnd()) {

            var particle = iterator.getData();

            var scale = particle.getMesh().scale.x; 
            if (scale > 0.01) {

                var rotation = 2 * Math.PI * ratio;
                particle.getMesh().rotation.z = rotation;

                scale -= this.delta;
                particle.getMesh().scale.set(scale, scale, scale);

                iterator = iterator.getNext();
            } else {

                this.scene.remove(particle.getMesh());

                particle.getMesh().geometry.dispose();
                particle.getMesh().material.dispose();

                // TODO: eliminate use of private method
                iterator = this.particlesToRemove._remove(iterator);
            }
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
        // this.startDataStreaming();
        this.startDataSynchronization();
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

    // streaming functionality

    // TODO: move to model
    // <script src="http://localhost:8080/socket.io/socket.io.js"></script>    
    startDataStreaming: function() {
        
        var obj = {};
        // obj.track = "morning";
        obj.track = "love";
        // obj.language = "en";

        this.socket = io('http://localhost:8080');
        this.socket.on('tweet', this.onDataReceive.bind(this));
        // this.socket.off('tweet', ...);

        this.socket.emit('start', obj); 
    },
    onDataReceive: function(data) {

        console.log(data);

        var dataRecord = new Application.GeoDataRecord({

            "longitude": data.coordinates.coordinates[0],
            "latitude": data.coordinates.coordinates[1],
            "timestamp": data.timestamp_ms

        });

        this.addParticleWithDataRecord(dataRecord);
    },

    // synchronization functionality

    startDataSynchronization: function() {

        var that = this;
        this.collection.fetch().done(function() {


            that.showDataRecords(0, 100000);
        });

    },
    showDataRecords: function(beginIndex, timeInterval) {

        if (beginIndex >= this.collection.length)
            return;

        var count = 0;
        var dataRecord = this.collection.at(beginIndex);
        var startTime = Number(dataRecord.get("timestamp"));
        var time = startTime;
        while (startTime + timeInterval > time) {

            var date = new Date();
            dataRecord.set("timestamp", "" + date.getTime());

            this.addParticleWithDataRecord(dataRecord);
            ++count;
            ++beginIndex;
            if (beginIndex >= this.collection.length)
                break;
            dataRecord = this.collection.at(++beginIndex);
            time = Number(dataRecord.get("timestamp"));
        }

        console.log("----------------");
        console.log("Twittes Viewed: " + count + " Within Iterval Of: " + 0.001 * timeInterval + "sec.");
        console.log("Twittes Viewed Total: " + beginIndex);
        console.log("Twittes Left To View: " + (this.collection.length - beginIndex));

        var that = this;
        setTimeout(function() {

            that.showDataRecords(beginIndex, timeInterval);
        }, 1000);
    },

    // dynamic functionality

    addParticleWithDataRecord: function(dataRecord) {

        var particle = new Application.DynamicGlobeParticle(dataRecord, this.globeRadius);
        particle.setLifeTime(3000);

        // Application.Debug.addAxes(particle.getMesh());

        this.scene.add(particle.getMesh());
        this.particles.pushBack(particle);
    },
    removeParticleIfNeeded: function() {

        var date = new Date();

        var iterator = this.particles.getBegin();
        while (iterator !== this.particles.getEnd()) {

            var particle = iterator.getData();
            if (particle.isDead(date.getTime())) {

                this.particlesToRemove.pushBack(particle);

                // TODO: eliminate use of private method
                iterator = this.particles._remove(iterator);
            } else {

                break;
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