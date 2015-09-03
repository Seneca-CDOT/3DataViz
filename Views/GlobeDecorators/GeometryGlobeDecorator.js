var Application = Application || {};

Application.GeometryGlobeDecorator = (function() {

    function GeometryGlobeDecorator() {

        // TODO: privatize
        this.intersected = null;
        this.countries = [];
        this.results = [];


    };
    Application.Helper.inherit(GeometryGlobeDecorator, Application.BaseGlobeDecorator);

    // properties
    GeometryGlobeDecorator.prototype.decorateGlobe = function(globeView) {

        privateMethods.loadGeometry.call(this, globeView);
    };

    // functionality
    GeometryGlobeDecorator.prototype.destroy = function(globeView) {

        for (var i = 0; i < this.countries.length; ++i) {

            if (globeView.globe !== this.countries[i]) {

                globeView.globe.remove(this.countries[i]);

                this.countries[i].material.dispose();
                this.countries[i].geometry.dispose();
            }
        }
        this.countries = null;

        this.colors = null;
        //this.added = null;

        Application.BaseGlobeDecorator.prototype.destroy.call(this, globeView);
    };

    GeometryGlobeDecorator.prototype.clickOnIntersect = function(globeView, intersect) {

        var mesh = intersect.object;
        privateMethods.highlightCountry.call(this, mesh);
    };

    GeometryGlobeDecorator.prototype.findCountry = function(country) {

        var countries = this.countries;
        var mesh = null;

        for (var i = 0; i < countries.length; i++) {

            var names = countries[i].userData.name;
            var codes = countries[i].userData.code;

            for (var k = 0; k < names.length; k++) {

                if (names[k].toLowerCase() == country.toLowerCase()) {
                    mesh = countries[i];
                    return mesh;
                }
            }
            for (var j = 0; j < codes.length; j++) {

                if (codes[j].toLowerCase() == country.toLowerCase()) {
                    mesh = countries[i];
                    return mesh;
                }
            }

        }
        //if (mesh === null)  console.log('something wrong with the name: ' + country);
    };

    var privateMethods = Object.create(GeometryGlobeDecorator.prototype);
    // visualization specific functionality
    privateMethods.loadGeometry = function(globeView) {

        var that = this;
        $.ajax({
            type: 'GET',
            url: 'Models/data/geodata.json',
            dataType: 'json',
            cache: false,
            error: function() {
                // console.log('An error occurred while processing a countries file.');
            },
            success: function(data) {

                privateMethods.addGeometry.call(that, globeView, data);
            }
        });
    };

    privateMethods.addGeometry = function(globeView, data) {

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
            var scale = globeView.globeRadius + 0.5;

            mesh.scale.set(scale, scale, scale);
            mesh.geometry.computeBoundingSphere();

            mesh.userData.name = data[countryName].dictionary;
            mesh.userData.code = data[countryName].code;

            // TODO: review
            globeView.globe.add(mesh);
            globeView.rayCatchers.push(mesh);

            this.countries.push(mesh);
        }

        Application._vent.trigger('globe/ready'); // notifies about ready state of geometry
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
