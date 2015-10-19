var Application = Application || {};

Application.BaseGlobeView = Application.BaseView.extend({
    tagName: "div",
    id: 'baseGlobe',
    template: _.template($("#globeViewTemplate").html()),
    initialize: function(decorators, collections) {
        Application.BaseView.prototype.initialize.call(this, decorators, collections);
    },
    destroy: function() {
        Application.BaseView.prototype.destroy.call(this);

        this.globe.material.dispose();
        this.globe.geometry.dispose();
        this.globe = null;

        this.stars.material.dispose();
        this.stars.geometry.dispose();
        this.stars = null;

    },
    reset: function() {
        Application.BaseView.prototype.reset.call(this);
    },
    init: function() {
        Application.BaseView.prototype.init.call(this);
    },
    addScene: function(){
        this.addGlobe();
        this.addStars();
    },
    addStars: function() {

        var geometry = new THREE.SphereGeometry(200, 32, 32);
        var material = new THREE.MeshBasicMaterial();
        material.map = THREE.ImageUtils.loadTexture('Assets/images/galaxy_starfield.png');
        material.side = THREE.BackSide;
        this.stars = new THREE.Mesh(geometry, material);
        this.scene.add(this.stars);
    },
    addGlobe: function() {
        var geometry = new THREE.SphereGeometry(this.globeRadius, 64, 64, 90 * (Math.PI / 180));
        var material = new THREE.MeshPhongMaterial({
            color: 0x4396E8,
            ambient: 0x4396E8,
            shininess: 20
        });
        this.globe = new THREE.Mesh(geometry, material);
        this.globe.name = "globe";
        this.scene.add(this.globe);
        this.globe.userData.name = 'globe';
        this.rayCatchers.push(this.globe);
    },
    addLight: function() {
        var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        dirLight.position.set(-500, 500, 500);
        dirLight.target = this.globe;
        this.camera.add(dirLight);
    },
    clickOn: function(event) {

        var closest = this.rayCast(this.rayCatchers, event);

        if (closest != null) {

            this.clickOnIntersect(closest);

            if (closest.object.userData.name != 'globe') {

                Application._vent.trigger('vizinfocenter/message/on', closest.object.userData.name[0]);
            } else return null;

        } else Application._vent.trigger('vizinfocenter/message/off');

        return closest;
    },
    showAllResults: function() {

    },
    showResults: function(results) {
        Application.BaseView.prototype.showResults.call(this, results);
    },
    sortResultsByCategory: function() {
        Application.BaseView.prototype.sortResultsByCategory.call(this);
    },
    determineCountry: function(point) {
        this.direction.subVectors(this.end, point.position);
        this.direction.normalize();

        var ray = new THREE.Raycaster(point.position, this.direction);

        var rayIntersects = ray.intersectObjects(this.rayCatchers);

        if (rayIntersects[0]) {

            return rayIntersects[0].object.userData.name;

        } else {

            return 'none';
        }
    },
    pointsPerCountry: function(array, countryname) {

        var i = 0;

        $.each(array, function(index, sprite) {

            if (sprite.userData.country == countryname) {

                i++;
            }

        });

        return i;

    },
    compareCountriesArrays: function(current, old) {

        var found = false;
        var difference = [];

        $.each(old, function(i, old_country) {

            $.each(current, function(k, cur_country) {

                if (cur_country.mesh == old_country.mesh)  found = true;

            });

            if (!found) difference.push(old_country);
            found = false;
        });

        return difference;
    },
});
