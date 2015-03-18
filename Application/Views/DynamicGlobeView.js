var Application = Application || {};

Application.DynamicGlobeView = Application.BaseGlobeView.extend({

    // framework methods

    initialize: function() {
        Application.BaseGlobeView.prototype.initialize.call(this);

        this.countries = [];
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

        this.requestCountriesData().done(this.addCountries.bind(this));

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
    addCountries: function(data) {

        var i = 10;
        for (var name in data) {

            var countrycolor = Application.Helper.rgbToHex(10, i++, 0);

            var material = new THREE.MeshPhongMaterial({
                shininess: 0,
                color: countrycolor
            });

            var geometry = new Map3DGeometry(data[name], 0);
            data[name].mesh = new THREE.Mesh(geometry, material);
            this.scene.add(data[name].mesh);

            var scale = 50.5;
            data[name].mesh.scale.set(scale, scale, scale);
            data[name].mesh.geometry.computeBoundingSphere();
            data[name].mesh.userData.name = name;
            data[name].mesh.userData.code = data[name].code;
            data[name].mesh.userData.used = false;
            data[name].mesh.userData.countrycolor = countrycolor;

            this.countries[data[name].code] = data[name].mesh;
            this.countries.push(data[name].mesh);
        }
    },

// TODO: move out of this view
    findCountryMeshByName: function(name) {
        for (var i = 0; i < this.countries.length; i++) {

            if (this.countries[i].userData.name.toLowerCase() == name.toLowerCase()) {

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
            this.cameraGoTo(intersects[0].object.userData.name);
        }
    },

    cameraGoTo: function(countryname) {

        // document.removeEventListener('mouseup', onMouseUp, false);
        // this.controls.removeMouse();
        
        this.moved = true;

        var countrymesh = this.findCountryMeshByName(countryname);
        if (countrymesh === undefined) {
            return;
        }

        var current = this.controls.getPosition();
        var destination = countrymesh.geometry.boundingSphere.center.clone();
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
    },

// TODO: move out of this view
    requestCountriesData: function() { 

        return $.ajax({
            type: 'GET',
            url: 'Models/geodata.json',
            dataType: 'json',
            cache: false, 
            error: function() {
                console.log('An error occurred while processing a countries file.');
            }
        });
    }
});