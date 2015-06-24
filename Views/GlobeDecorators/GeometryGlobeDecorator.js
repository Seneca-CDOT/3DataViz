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

    GeometryGlobeDecorator.prototype.findCountry = function(country, id) {

        switch (id) {

            case 'countryname':
                var mesh = privateMethods.findCountryMeshByName.call(this, country);
                break;
            case 'countrycode':
                var mesh = privateMethods.findCountryMeshByCode.call(this, country);
                break;
        }

        return mesh;
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

                console.log('An error occurred while processing a countries file.');
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

            mesh.userData.name = countryName;
            mesh.userData.code = data[countryName].code;

            // TODO: review
            globeView.globe.add(mesh);
            globeView.rayCatchers.push(mesh);

            this.countries.push(mesh);
        }

        Application._vent.trigger('globe/ready'); // notifies about ready state of geometry
    };

    // country selection functionality
    privateMethods.findCountryMeshByName = function(name) {

        var countries = this.countries;

        for (var i = 0; i < countries.length; i++) {

            var score = privateMethods.checkCountryName(name, countries[i].userData.name);

            if (score < 3) {

                return countries[i];

            }

        }
                console.log('something wrong with the name: ' + name);
    };

    privateMethods.findCountryMeshByCode = function(code) {

        var countries = this.countries;
        for (var i = 0; i < countries.length; i++) {

            if (countries[i].userData.code.toLowerCase() == code.toLowerCase()) {

                return countries[i];
            }
        }
    };

    privateMethods.checkCountryName = function(UserDataname, InitialDataName) {

        var s = UserDataname;
        var t = InitialDataName;

        var d = []; //2d matrix

        // Step 1
        var n = s.length;
        var m = t.length;

        if (n == 0) return m;
        if (m == 0) return n;

        //Create an array of arrays in javascript (a descending loop is quicker)
        for (var i = n; i >= 0; i--) d[i] = [];

        // Step 2
        for (var i = n; i >= 0; i--) d[i][0] = i;
        for (var j = m; j >= 0; j--) d[0][j] = j;

        // Step 3
        for (var i = 1; i <= n; i++) {
            var s_i = s.charAt(i - 1);

            // Step 4
            for (var j = 1; j <= m; j++) {

                //Check the jagged ld total so far
                if (i == j && d[i][j] > 4) return n;

                var t_j = t.charAt(j - 1);
                var cost = (s_i == t_j) ? 0 : 1; // Step 5

                //Calculate the minimum
                var mi = d[i - 1][j] + 1;
                var b = d[i][j - 1] + 1;
                var c = d[i - 1][j - 1] + cost;

                if (b < mi) mi = b;
                if (c < mi) mi = c;

                d[i][j] = mi; // Step 6

                //Damerau transposition
                if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
                }
            }
        }

        // Step 7
        return d[n][m];

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
