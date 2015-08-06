var Application = Application || {};

Application.BaseView = Backbone.View.extend({
    tagName: "div",
    id: 'baseGlobe',
    template: _.template($("#globeViewTemplate").html()),
    events: {

        'mousemove': 'onMouseMove',
        'mouseup': 'onMouseUp'
    },

    // framework methods
    initialize: function(decorators, collections) {

        this.container = this.$el[0];
        this.offset = 250;
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.controls = null;
        this.tween = null;
        this.categories = [];
        this.end = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.activeCategories = []; // holds active categories

        if (decorators !== undefined)
            this.decorators = decorators;
        else
            this.decorators = [];

        this.rayCatchers = [];
        this.globeRadius = 50;

        // TODO: review
        this.moved = false;
        this.orbitOn = false;

        this.idle = true;
        this.timer = [];

        this.requestedAnimationFrameId = null;
        var that = this;

        this.collection = [];

        $.each(collections, function(index, collection) {

            that.collection[index] = collection;

        });

        this.suscribe();

        // TODO: review
        $(window).on('resize', this.onWindowResize.bind(this));
        Application._vent.on('filters/add', this.addCategory, this);
        Application._vent.on('filters/remove', this.removeCategory, this);
    },
    suscribe: function() {
        Application._vent.on('data/ready', this.showResults, this);
    },
    destroy: function() {

        console.log("BaseView destory");

        this.remove();
        this.unbind();

        this.container = null;

        // TODO: review
        this.scene = null;
        this.renderer = null;
        this.camera = null;
        this.controls = null;
        this.tween = null;

        $.each(this.collection, function(index, collection) {

            collection = null;
        });

        // TODO: review
        this.rayCatchers = null;

        if (this.timer) {

            $.each(this.timer, function(index, id) {
                clearTimeout(id);
            });
            this.timer = null;
        }

        if (this.requestedAnimationFrameId) {

            cancelAnimationFrame(this.requestedAnimationFrameId);
            this.requestedAnimationFrameId = null;
        }

        // TODO: review
        $(window).unbind('resize');
        Application._vent.unbind('data/ready', this.showResults);
        this.collection[0].unbind();
        Application._vent.unbind('filters/add', this.addCategory);
        Application._vent.unbind('filters/remove', this.removeCategory);
    },
    render: function() {

        this.show();
        return this;
    },

    rayCast: function(objects, e) {

        var x = e.clientX;
        var y = e.clientY;

        x -= this.container.offsetLeft;
        y -= this.container.offsetTop;

        var vector = new THREE.Vector3((x / this.container.offsetWidth) * 2 - 1, -(y / this.container.offsetHeight) * 2 + 1, 0.5);
        vector.unproject(this.camera);

        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());
        var intersects = ray.intersectObjects(objects);

        //Tweak distance and find closest object. Because there is a bug on calculating distance to sprite objects.
        var minDis = 1000000;
        var closest = null;
        $.each(intersects, function(i, intersect) {
            var dis = ray.ray.origin.distanceTo(intersect.point);
            if (minDis > dis) {
                minDis = dis;
                closest = intersect;
            }
        });

        return closest;
    },
    // member methods
    onMouseUp: function(e) {

      if (!this.moved) {
          this.clickOn(e);
      }
      this.moved = false;
    },
    onMouseMove: function(e) {

        if (e.which == 1) {

            this.moved = true;
        }

        // TODO: fix issue with particles then uncomment
        // function setTimer() {

        //     this.idle = false;

        //     clearTimeout(this.timer);

        //     var that = this;
        //     this.timer = setTimeout(function() {

        //         that.idle = true
        //     }, 5000);
        // };
        // setTimer.call(this);
    },
    show: function() {

        this.init();
        this.decorateProperties();
        this.startDataSynchronization();
    },

    init: function() {

        this.addSceneAndRenderer();
        this.addCamera();
        this.addScene();
        this.addLight();
        this.addControls();
        this.addHelpers();
        this.renderScene();
    },
    decorateProperties: function() {

        if(this.decorators.length > 0){
            for (var i = 0; i < this.decorators.length; ++i) {
                this.decorators[i].decorateGlobe(this);
            }
        }
    },
    startDataSynchronization: function() {

    },

    addSceneAndRenderer: function() {

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000);

        var width = this.options.size.width - this.offset;
        var height = this.options.size.height;
        this.renderer.setSize(width, height);

        this.container.appendChild(this.renderer.domElement);
        this.container.style.position = "absolute";
        this.container.style.width = this.options.size.width - this.offset;
        this.container.style.left = this.options.origin.x;
    },
    addCamera: function() {

        var width = this.options.size.width - this.offset;
        var height = this.options.size.height;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);

        if (this.options.position) {

            this.camera.position.x = this.options.position.x;
            this.camera.position.y = this.options.position.y;
            this.camera.position.z = this.options.position.z;
        } else {

            this.camera.position.z = 100;
        }

        this.scene.add(this.camera);
    },
    addScene: function() {
    },
    addLight: function() {

        // var ambLight = new THREE.AmbientLight(0xFFFFFF);
        var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        dirLight.position.set(-1000, 1000, 1000);
        dirLight.target = this.mesh;

        // this.scene.add(ambLight);
        this.camera.add(dirLight);
    },
    renderScene: function() {

        this.requestedAnimationFrameId = requestAnimationFrame(this.renderScene.bind(this));

        Application.Debug.stats.begin();
        this.updateScene();
        this.renderer.render(this.scene, this.camera);
        Application.Debug.stats.end();
    },
    updateScene: function() {

        this.controls.update();

        if (this.orbitOn === true) {

            TWEEN.update();
        }

        // TODO: fix issue with particles then uncomment
        // if (this.idle === true) {

        //     this.mesh.rotation.y -= 0.0003;
        // }
    },
    addControls: function() {

        this.controls = new THREE.OrbitControls(this.camera, this.container);
        this.controls.minDistance = 55;
        this.controls.maxDistance = 150;
        this.controls.userPan = false;
    },
    addHelpers: function() {
        Application.Debug.addStats();
    },

    // TODO: move out of this view
    onWindowResize: function() {

        this.camera.aspect = (window.innerWidth - this.offset) / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth - this.offset, window.innerHeight);
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
        var intersects = ray.intersectObjects(this.rayCatchers);

        if (intersects.length > 0) {

            var closestIntersect = intersects[0];
            this.clickOnIntersect(closestIntersect);
        }

        return intersects[0];
    },
    clickOnIntersect: function(intersect) {

        var destination = null;
        var mesh = intersect.object;
        if (mesh !== this.mesh || mesh !== this.globe) {

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
    cameraGoTo: function(destination) {

        // TODO: review
        for (var i = 0; i < this.decorators.length; ++i) {

            this.decorators[i].cameraGoTo(this, destination);
        }

        var current = this.controls.getPosition();
        this.moved = true;

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

                return function() {

                    onUpdate(this, that);
                };
            })(this))
            .onComplete((function(that) {

                return function() {

                    onComplete(this, that);
                };
            })(this));

        function onUpdate(point, that) {

            that.controls.updateView({

                x: point.x,
                y: point.y,
                z: point.z
            });
        };

        function onComplete(point, that) {

            that.orbitOn = false;
        };

        this.orbitOn = true;
        this.tween.start();
    },
    showResults: function(results) {
      if (this.categories.length > 0 && this.categories[0] !== undefined) {
          Application._vent.trigger('controlpanel/categories', this.categories);
      }
    },
    sortResultsByCategory: function() {},
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
});
