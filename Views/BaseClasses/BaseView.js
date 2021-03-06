var Application = Application || {};

Application.BaseView = Backbone.View.extend({
  template: _.template($("#globeViewTemplate").html()),
  events: {
    'mousemove': 'onMouseMove',
    'mouseup': 'onMouseUp',
    'mousedown': 'onMouseDown'
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

    if (decorators.length) this.decorators = decorators;
    else this.decorators = [];

    this.collection = [];

    for (var i = 0; i < collections.length; i++) {
      this.collection.push(collections[i]);
    }
    this.rayCatchers = [];
    this.globeRadius = 50;
    this.moved = false;
    this.orbitOn = false;
    this.idle = true;
    this.timer = [];
    this.requestedAnimationFrameId = null;
    this.suscribe();
    this.sortedByPercentageData = {};
    this.tweenings = []; // holds references for tween instances

    Application._vent.trigger('title/message/on', Application.userConfig.templateTitle);

  },
  suscribe: function() {
    // console.log("BaseView suscribe");
    Application._vent.on('data/ready', this.checkAttributes, this);
    $(window).on('resize', this.onWindowResize.bind(this));
    Application._vent.on('filters/add', this.addCategory, this);
    Application._vent.on('filters/remove', this.removeCategory, this);
    Application._vent.on('timeline/message', this.findObjectsbyDate, this);
    Application._vent.on('timeline/clear', this.reset, this);
  },
  unsuscribe: function() {
    $(window).unbind('resize');
    Application._vent.unbind('data/ready', this.checkAttributes);
    Application._vent.unbind('filters/add', this.addCategory);
    Application._vent.unbind('filters/remove', this.removeCategory);
    Application._vent.unbind('timeline/message', this.findObjectsbyDate);
    Application._vent.unbind('timeline/clear', this.reset);

  },
  reset: function() {

    this.activeCategories.length = 0;
  },
  checkAttributes: function() {

        if (Application.attrsMap['category']) this.filtersAction();

        if (Application.attrsMap['date']) this.timelineAction();
        else this.getAllResults();

        Application._vent.trigger('controlpanel/message/off');
  },
  destroy: function() {

    // console.log("BaseView destory");

    this.remove();
    this.unbind();

    this.container = null;

    // TODO: review
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.controls = null;
    this.tween = null;
    this.categories = null;

    // TODO: review
    this.rayCatchers = null;

    if (this.timer.length) {

      $.each(this.timer, function(index, id) {
        clearTimeout(id);
      });
      this.timer = null;
    }

    if (this.requestedAnimationFrameId) {

      cancelAnimationFrame(this.requestedAnimationFrameId);
      this.requestedAnimationFrameId = null;
    }

    for (var i = 0; i < this.decorators.length; ++i) {

      this.decorators[i].destroy(this);
    }
    this.decorators = null;

    for (var i = 0; i < this.collection.length; ++i) {

      this.collection[i] = null;
    }

    this.collection = null;

    this.unsuscribe();
    this.tweenings.length = 0;

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
  onMouseDown: function(e){
  },
  switchCamera: function(){
  },
  // member methods
  onMouseUp: function(e) {

    if (!this.moved) {
      this.clickOn(e);
    }
    this.moved = false;
  },
  onMouseMove: function(e) {
    if (e.which == 1) this.moved = true;
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
    // this.addHelpers();
    this.renderScene();
  },
  decorateProperties: function() {

    if (this.decorators.length){
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

    // Application.Debug.stats.begin();
    this.updateScene();
    this.renderer.render(this.scene, this.camera);
    // Application.Debug.stats.end();
  },
  updateScene: function() {

    if (this.controls) {
      this.controls.update();
      TWEEN.update();
    }
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
    if (mesh !== this.mesh && mesh !== this.globe) {

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
  getAllResults: function() {

  },
  showResults: function(results) {

    Application._vent.trigger('controlpanel/message/off');

    this.reset();

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
      category.index = index;
      category.color = Application.Helper.getRandomColor(obj);
    });
  },
  addCategory: function(group) {

    this.activeCategories.push(group.category);
    this.sortResultsByCategory();
  },
  removeCategory: function(group) {

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
  timelineAction: function() {

    $.each(this.tweenings, function(i, tween) {
      tween.stop();
    });

    this.reset();

    this.sortResultsByDate();
  },
  filtersAction: function() {

    var results = this.collection[0].models;
    this.getCategoriesWithColors(results);
    Application._vent.trigger('filters/on');
  },
  findObjectsbyDate: function(number) {

    var data = this.sortedByPercentageData[number];
    if (data.length) this.showResults(data);
  },
  sortResultsByDate: function() {

    if ( typeof Application.attrsMap['date2'] == "undefined") {

      var sortedByDateData = this.sortResultsByDateColumn();

    } else {

      var sortedByDateData = this.sortResultsByDateRow();
    }

    var dates = _.keys(sortedByDateData);

    var dateRanges = this.getDateRanges(dates);

    Application._vent.trigger('timeline/ready', dateRanges);

    this.sortedByPercentageData = this.sortResultsByPercentage(sortedByDateData);

  },
  sortResultsByPercentage: function(data) {
    var pointsRemainder = 0;
    var len = (_.keys(data)).length;
    if (len > 10) pointsRemainder = len % 100;
    var pointsPerOnePercent = 0;
    var sortedByPercentage = {};

    if (pointsRemainder) {
      pointsPerOnePercent = parseInt(len / 98);
    } else {
      pointsPerOnePercent = parseInt(len / 99);
    }

    if (pointsPerOnePercent <= 1) pointsPerOnePercent = 1;

    var j = 1;
    var k = 1;

    for( var i = 1; i < 101; i++) {

      sortedByPercentage[i] = [];
    }

    var shift = 1;

    if (len < 100) shift = parseInt(100/len);

    $.each(data, function(i, item) {
      if ( Array.isArray(item) ) {
        item.forEach(function(item, i) {
          sortedByPercentage[j].push(item);
        });
      } else sortedByPercentage[j].push(item);
      if ( !(k % pointsPerOnePercent) ) j+=shift;
      k++;
    });
    return sortedByPercentage;
  },
  getDateRanges: function(dates) {
    var ranges = [];
    var len = dates.length;
    var numOfSegments = len;
    if (len > 5) numOfSegments = 5;
    var pointsPerSegments = parseInt(len / numOfSegments);

    for ( var i = 0; i < len; i+= pointsPerSegments) {
      ranges.push(dates[i]);
    }

    if (ranges[ranges.length-1] != dates[dates.length-1])  ranges.push(dates[dates.length-1]);

    return ranges;
  },
  sortResultsByDateColumn: function() {

    var data = this.collection[0].models;

    data.sort(function(a,b) {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    });

    var uniques = _.chain(data).map(function(item) {
      return item.date;
    }).uniq().value();

    $.each(uniques, function(i, element) {
      if (element === undefined)
      uniques.splice(i, 1);
    });

    var newdata = {};

    $.each(uniques, function(i,unique) {

      newdata[unique] = [];

    });

    $.each(data, function(i, obj) {

      $.each(uniques, function(i, unique) {

        if (unique == obj.date) {

          newdata[unique].push(obj);

        }
      });
    });

    //newdata.prototype.length = (_.keys(newdata)).length;

    return newdata;

  },
  sortResultsByDateRow: function() {

    var data = this.collection[0].models;

    var dateAttrs = this.getDatesColumnNames();

    var newdata = {};

    var invertedMap = _.invert(Application.attrsMap);

    $.each(dateAttrs, function(i, date) {

      newdata[date] = [];

    });

    $.each(data, function(i, obj) {

      $.each(dateAttrs, function(k, date) {

        var name = invertedMap[date];

        var value = Application.Helper.getNumber(obj[name]);

        newdata[date].push({ value: value, country: obj['country'] });
      });
    });

    return newdata;

  },
  getDatesColumnNames: function() {

    var array = [];

    $.each(Application.attrsMap, function(key, value) {

      if (/date/.exec(key)) {
        //   var val = Application.Helper.getNumber(value);
        array.push(value);
      }
    });

    return array;

  },
  tweenit: function(mesh, end, receive, seconds) {
    var that = this;

    var start = mesh.material.color;

    var t = new TWEEN.Tween(start);

    t.to(end, seconds*1000);

    t.onUpdate( function() {
      receive(mesh, this);
    }
  );

  t.start();

  this.tweenings.push(t);

},
});
