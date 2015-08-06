var Application = Application || {};

Application.BaseGlobeView = Application.BaseView.extend({
    tagName: "div",
    id: 'baseGlobe',
    template: _.template($("#globeViewTemplate").html()),
    events: {

        'mousemove': 'onMouseMove',
        'mouseup': 'onMouseUp'
    },
    destroy: function() {

        // TODO: review
        for (var i = 0; i < this.decorators.length; ++i) {

            this.decorators[i].destroy(this);
        }
        this.decorators = null;

        this.globe.material.dispose();
        this.globe.geometry.dispose();
        this.globe = null;

        this.stars.material.dispose();
        this.stars.geometry.dispose();
        this.stars = null;

        Application.BaseView.prototype.destroy.call(this);
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

        // var globalLight = new THREE.HemisphereLight(0xFFFFFF,0xFFFFFF,1);
        var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        dirLight.position.set(-500, 500, 500);
        dirLight.target = this.globe;

        // this.scene.add(globalLight);
        this.camera.add(dirLight);
    },

    clickOn: function(event) {

        var closest = this.rayCast(this.rayCatchers, event);
        if (closest != null) {
            this.clickOnIntersect(closest);

            if (closest.object.userData.name != 'globe') {

                Application._vent.trigger('vizinfocenter/message/on', closest.object.userData.name[0]);
            }
            if (closest.object.userData.name == 'globe') { return null; }
        }
        return closest;
    },
    clickOnIntersect: function(intersect) {

        //TODO need to merge BaseView intersect
        var destination = null;
        var mesh = intersect.object;
        if (mesh !== this.globe) {

            // TODO: review
            for (var i = 0; i < this.decorators.length; ++i) {

                this.decorators[i].clickOnIntersect(this, intersect);
            }

            destination = mesh.geometry.boundingSphere.center.clone();
        } else {

            destination = intersect.point;
        }

        if (destination) {

            destination.setLength(this.controls.getRadius());
            this.cameraGoTo(destination);
        }
    },


    showAllResults: function() {},
    getCategories: function(results){
      this.categories = Application.Filter.getCategories(results);
    },
    getCategoriesWithColors: function(results, obj){
      this.categories = Application.Filter.getCategories(results);
      $.each(this.categories, function(index, category){
          category.color = Application.Helper.getRandomColor(obj);
      });
    },
    addCategory: function(group) {

        group.name;

        this.activeCategories.push(group.category);
        this.sortResultsByCategory();
    },
    removeCategory: function(group) {

        group.name;

        var i = this.activeCategories.indexOf(group.category);
        if (i != -1) {
            this.activeCategories.splice(i, 1);
        }
        this.sortResultsByCategory();
    },
    getCategoryObj: function(categoryName){

      var category;
      $.each(this.categories, function(index, c){
        if(c.name === categoryName){
          category = c;
        }
      });
      return category;

    },
    getColorByCategory: function(categoryName){

      var color;
      $.each(this.categories, function(index, category){
        if(category.name === categoryName){
          color = category.color.replace('#','0x');
        }
      });
      return color || '0xffffff';

    },
    sortResultsByCategory: function() {},
    determineCountry: function(point) {

        this.direction.subVectors(this.end, point.position);
        this.direction.normalize();

        //this.scene.updateMatrixWorld();
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
});
