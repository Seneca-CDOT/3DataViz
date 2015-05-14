var Application = Application || {};

Application.GeometryGlobeDecorator = (function() {

    function GeometryGlobeDecorator() {

        // TODO: privatize
        this.intersected = null; 
        this.countries = [];
    };

    // properties
    GeometryGlobeDecorator.prototype.decorate = function(globe) {

        privateMethods.loadGeometry.call(this, globe);
    };

    // functionality
    GeometryGlobeDecorator.prototype.cameraGoTo = function(globe, countryMesh) {

        privateMethods.highlightCountry.call(this, countryMesh);
    };


    var privateMethods = Object.create(GeometryGlobeDecorator.prototype);
     // visualization specific functionality
    privateMethods.loadGeometry = function(globe) { 

        var that = this;
        // that.willLoadGeometry();
        $.ajax({
            type: 'GET',
            url: 'Models/geodata.json',
            dataType: 'json',
            cache: false, 
            error: function() {

                console.log('An error occurred while processing a countries file.');
            },
            success: function(data) {

                privateMethods.addGeometry.call(that, data, globe);
                // that.didLoadGeometry();
            }
        });
    };
    privateMethods.addGeometry = function(data, globe) {

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

            // TODO: review
            var scale = globe.globeRadius + 0.5;

            mesh.scale.set(scale, scale, scale);
            mesh.geometry.computeBoundingSphere();

            mesh.userData.name = countryName;
            mesh.userData.code = data[countryName].code;

            // TODO: review
            globe.globe.add(mesh);
            globe.rayCatchers.push(mesh);

            this.countries.push(mesh);
        }
    };

    // privateMethods.willLoadGeometry = function() {
    // };

    // privateMethods..didLoadGeometry = function() {
    // };

    // country selection functionality
    privateMethods.findCountryMeshByName = function(name) {

        var countries = this.countries;
        for (var i = 0; i < countries.length; i++) {

            if (countries[i].userData.name.toLowerCase() == name.toLowerCase()) {

                return countries[i];
            }
        }
    };

    privateMethods.findCountryMeshByCode = function(code) {

        var countries = this.countries;
        for (var i = 0; i < countries.length; i++) {

            if (countries[i].userData.code.toLowerCase() == code.toLowerCase()) {

                return countries[i];
            }
        }
    };

    privateMethods.highlightCountry = function(object) {

        var intersected = this.intersected;
        if (intersected != object) {

            // for countries shapes
            if (intersected) {

                intersected.material.color.setHex(intersected.currentColor); 
            }

            this.intersected = object;
            intersected = this.intersected;

            intersected.currentColor = intersected.material.color.getHex();
            intersected.material.color.setHex(0x0000FF);
        }
    };

    return GeometryGlobeDecorator;
})();
   