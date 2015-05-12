var Application = Application || {};

Application.BaseGeometryGlobeView = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function() {

        Application.BaseGlobeView.prototype.initialize.call(this);
    },
    render: function() {

        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    },

    _loadGeometry: function() { 

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

                that._addGeometry(data);
                that.didLoadGeometry();
            }
        });
    },
    _addGeometry: function(data) {

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
            mesh.userData.used = false;
            mesh.userData.countrycolor = countryColor;

            this.globe.add(mesh);
            this.rayCatchers.push(mesh);
        }
    },

    // member methods
    initGlobe: function() {

        Application.BaseGlobeView.prototype.initGlobe.call(this);

        this._loadGeometry();
    },
    willLoadGeometry: function() {

    },
    didLoadGeometry: function() {
        
    }
});