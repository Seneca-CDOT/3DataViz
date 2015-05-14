var Application = Application || {};

Application.BaseGeometryGlobeView = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function() {

        Application.BaseGlobeView.prototype.initialize.call(this);

        // intersected mesh
        this.intersected = null; 
        this.countries = [];
    },

    // member methods
    initGlobe: function() {

        Application.BaseGlobeView.prototype.initGlobe.call(this);

        this.loadGeometry();
    },
    loadGeometry: function() { 

        var that = this;

        that.willLoadGeometry();
        $.ajax({
            type: 'GET',
            url: 'Models/geodata.json',
            dataType: 'json',
            cache: false, 
            error: function() {

                console.log('An error occurred while processing a countries file.');
            },
            success: function(data) {

                that.addGeometry(data);
                that.didLoadGeometry();
            }
        });
    },
    addGeometry: function(data) {

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

            mesh.userData.name = countryName;
            mesh.userData.code = data[countryName].code;

            // TODO: review
            this.globe.add(mesh);
            this.rayCatchers.push(mesh);
            this.countries.push(mesh);
        }
    },
    willLoadGeometry: function() {

    },
    didLoadGeometry: function() {

    },

    // country selection functionality
    findCountryMeshByName: function(name) {

        for (var i = 0; i < this.countries.length; i++) {

            if (this.countries[i].userData.name.toLowerCase() == name.toLowerCase()) {

                return this.countries[i];
            }
        }
    },
    findCountryMeshByCode: function(code) {

        for (var i = 0; i < this.countries.length; i++) {

            if (this.countries[i].userData.code.toLowerCase() == code.toLowerCase()) {

                return this.countries[i];
            }
        }
    },
    highlightCountry: function(object) {

        if (this.intersected != object) {

            // for countries shapes
            if (this.intersected) {

                this.intersected.material.color.setHex(this.intersected.currentColor); 
            }
            this.intersected = object;
            this.intersected.currentColor = this.intersected.material.color.getHex();
            this.intersected.material.color.setHex(0x0000FF);
        }
    },

    // interaction
    cameraGoTo: function(countrymesh) {

        Application.BaseGlobeView.prototype.cameraGoTo.call(this, countrymesh);

        this.highlightCountry(countrymesh);
    }   
});