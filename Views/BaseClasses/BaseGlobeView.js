var Application = Application || {};

Application.BaseGlobeView = Application.BaseView.extend({
    tagName: "div",
    id: 'baseGlobe',
    template: _.template($("#globeViewTemplate").html()),
    // events: {
    //
    //     'mousemove': 'onMouseMove',
    //     'mouseup': 'onMouseUp'
    // },
    destroy: function() {
        Application.BaseView.prototype.destroy.call(this);

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
        var dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
        dirLight.position.set(-500, 500, 500);
        dirLight.target = this.globe;

        // this.scene.add(globalLight);
        this.camera.add(dirLight);
    },
    // <<<<<<< HEAD
    //     renderGlobe: function() {
    //
    //         this.requestedAnimationFrameId = requestAnimationFrame(this.renderGlobe.bind(this));
    //
    //         Application.Debug.stats.begin();
    //         this.updateGlobe();
    //         this.renderer.render(this.scene, this.camera);
    //         Application.Debug.stats.end();
    //     },
    //     updateGlobe: function() {
    //
    //         this.controls.update();
    //
    //         //    if (this.orbitOn === true) {
    //
    //         TWEEN.update();
    //         //    }
    //
    //         // TODO: fix issue with particles then uncomment
    //         // if (this.idle === true) {
    //
    //         //     this.globe.rotation.y -= 0.0003;
    //         // }
    //     },
    clickOn: function(event) {

        var closest = this.rayCast(this.rayCatchers, event);
        if (closest != null) {
            this.clickOnIntersect(closest);

            if (closest.object.userData.name != 'globe') {

                Application._vent.trigger('vizinfocenter/message/on', closest.object.userData.name[0]);
            }
            if (closest.object.userData.name == 'globe') {

                return null; }
            } else {

                Application._vent.trigger('vizinfocenter/message/off');
            }
            return closest;
        },
        // clickOnIntersect: function(intersect) {
        //
        //     var destination = null;
        //     var mesh = intersect.object;
        //     if (mesh !== this.globe) {
        //
        //         // TODO: review
        //         for (var i = 0; i < this.decorators.length; ++i) {
        //
        //             this.decorators[i].clickOnIntersect(this, intersect);
        //         }
        //
        //         destination = mesh.geometry.boundingSphere.center.clone();
        //     } else {
        //
        //         destination = intersect.point;
        //     }
        //
        //     if (destination) {
        //
        //         destination.setLength(this.controls.getRadius());
        //         this.cameraGoTo(destination);
        //     }
        // },
        // cameraGoTo: function(destination) {
        //
        //     // TODO: review
        //     for (var i = 0; i < this.decorators.length; ++i) {
        //
        //         this.decorators[i].cameraGoTo(this, destination);
        //     }
        //
        //     var current = this.controls.getPosition();
        //     this.moved = true;
        //
        //     if (this.orbitOn == true) {
        //
        //         this.tween.stop();
        //     }
        //
        //     this.tween = new TWEEN.Tween(current)
        //     .to({
        //         x: destination.x,
        //         y: destination.y,
        //         z: destination.z
        //     }, 1000)
        //     .easing(TWEEN.Easing.Sinusoidal.InOut)
        //     .onUpdate((function(that) {
        //
        //         return function() {
        //
        //             onUpdate(this, that);
        //         };
        //     })(this))
        //     .onComplete((function(that) {
        //
        //         return function() {
        //
        //             onComplete(this, that);
        //         };
        //     })(this));
        //
        //     function onUpdate(point, that) {
        //
        //         that.controls.updateView({
        //
        //             x: point.x,
        //             y: point.y,
        //             z: point.z
        //         });
        //     };
        //
        //     function onComplete(point, that) {
        //
        //         that.orbitOn = false;
        //     };
        //
        //     this.orbitOn = true;
        //     this.tween.start();
        // },
        // showResults: function(results) {
        //     if (this.categories.length > 0 && this.categories[0] !== undefined) {
        //         Application._vent.trigger('controlpanel/categories', this.categories);
        //     }
        // },
        showAllResults: function() {},
        // getCategories: function(results){
        //     this.categories = Application.Filter.getCategories(results);
        // },
        // getCategoriesWithColors: function(results, obj){
        //     this.categories = Application.Filter.getCategories(results);
        //     $.each(this.categories, function(index, category){
        //         category.color = Application.Helper.getRandomColor(obj);
        //     });
        // },
        // addCategory: function(group) {
        //
        //     this.activeCategories.push(group.category);
        //     this.sortResultsByCategory();
        // },
        // removeCategory: function(group) {
        //
        //     var i = this.activeCategories.indexOf(group.category);
        //     if (i != -1) {
        //         this.activeCategories.splice(i, 1);
        //     }
        //     this.sortResultsByCategory();
        // },
        // getCategoryObj: function(categoryName){
        //
        //     var category;
        //     $.each(this.categories, function(index, c){
        //         if(c.name === categoryName){
        //             category = c;
        //         }
        //     });
        //     return category;
        //
        // },
        // getColorByCategory: function(categoryName){
        //
        //     var color;
        //     $.each(this.categories, function(index, category){
        //         if(category.name === categoryName){
        //             color = category.color.replace('#','0x');
        //         }
        //     });
        //     return color || '0xffffff';
        //
        // },
        sortResultsByCategory: function() {},
        determineCountry: function(point) {

            this.direction.subVectors(this.end, point.position);
            this.direction.normalize();

            //this.scene.updateMatrixWorld();
            var ray = new THREE.Raycaster(point.position, this.direction);

            var rayIntersects = ray.intersectObjects(this.rayCatchers);

            if (rayIntersects[0]) {
                destination.setLength(this.controls.getRadius());
                this.cameraGoTo(destination);
            }
        },
        // showResults: function(results){
        //   Application.BaseView.prototype.showResults.call(this, results);
        // },
        showAllResults: function() {},
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
        // sortResultsByDate: function() {
        //
        //     if ( typeof Application.attrsMap['date2'] == "undefined") {
        //
        //         this.sortedByDateData = this.sortResultsByDateColumn();
        //
        //     } else {
        //
        //         this.sortedByDateData = this.sortResultsByDateRow();
        //     }
        //
        //     var names = _.keys(this.sortedByDateData);
        //
        //     Application._vent.trigger('timeline/ready', names);
        //
        //     var first = _.keys(this.sortedByDateData)[0];
        //     //this.showResults(this.sortedByDateData[first]);
        //
        // },
        // sortResultsByDateColumn: function() {
        //
        //     var data = this.collection[0].models;
        //
        //     data.sort(function(a,b) {
        //         return new Date(a.date).getTime() - new Date(b.date).getTime()
        //     });
        //
        //     var uniques = _.chain(data).map(function(item) {
        //         return item.date
        //     }).uniq().value();
        //
        //     $.each(uniques, function(i, element) {
        //         if (element === undefined)
        //         uniques.splice(i, 1);
        //     });
        //
        //     var newdata = {};
        //
        //     $.each(uniques, function(i,unique) {
        //
        //         newdata[unique] = [];
        //
        //     });
        //
        //     $.each(data, function(i, obj) {
        //
        //         $.each(uniques, function(i, unique) {
        //
        //             if (unique == obj.date) {
        //
        //                 newdata[unique].push(obj);
        //
        //             }
        //         });
        //     });
        //
        //     // return newdata;
        //     console.log(newdata);
        //     return newdata;
        //
        // },
        // sortResultsByDateRow: function() {
        //
        //     var data = this.collection[0].models;
        //
        //     var dateAttrs = this.getDatesColumnNames();
        //
        //
        //     var newdata = {};
        //
        //     $.each(dateAttrs, function(i, date) {
        //
        //         newdata[date] = [];
        //
        //     });
        //
        //     $.each(data, function(i, obj) {
        //
        //         $.each(dateAttrs, function(i, date) {
        //
        //             var name = _.invert(Application.attrsMap)[date];
        //
        //             var value = Application.Helper.getNumber(obj[name]);
        //
        //             newdata[date].push({ value: value, country: obj['country'] });
        //         });
        //     });
        //
        //     // return newdata;
        //     console.log(newdata);
        //     return newdata;
        //
        // },
        // getDatesColumnNames: function() {
        //
        //     var array = [];
        //
        //     $.each(Application.attrsMap, function(key, value) {
        //
        //         if (/date/.exec(key)) {
        //             //   var val = Application.Helper.getNumber(value);
        //             array.push(value);
        //         }
        //     });
        //
        //     return array;
        //
        // },
        compareCountriesArrays: function(current, old) {

            var found = false;
            var difference = [];

            $.each(old, function(i, old_country) {

                $.each(current, function(k, cur_country) {

                    if (cur_country.mesh == old_country.mesh) {
                        found = true;
                    }

                });

                if (!found) {
                    difference.push(old_country);

                }

                found = false;
            });

            return difference;

        },
    });
