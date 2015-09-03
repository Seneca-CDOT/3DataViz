var Application = Application || {};

Application.PointCloudLayer = Application.BasePointCloudView.extend({

    // framework methods
    initialize: function(decorator, collections) {
        Application.BasePointCloudView.prototype.initialize.call(this, decorator, collections);
        this.textMeshs = [];
        this.pointclouds = [];
        this.geometries = [];
        this.material = new THREE.PointCloudMaterial( {
          size: 1,
          color: 0xffffff,
          transparent: true
        });
    },
    suscribe: function() {
        Application.BasePointCloudView.prototype.suscribe.call(this);
    },
    destroy: function() {

        this.lineMesh = null;
        this.results = null;
        this.material = null;
        var that = this;
        $.each(this.textMeshs, function(index, mesh) {
            that.scene.remove(mesh);
            mesh = null;
        });
        $.each(this.pointclouds, function(index, pointcloud){
            that.scene.remove(pointcloud);
            pointcloud.geometry.dispose();
            pointcloud.material.dispose();
            pointcloud = null;
        });
        $.each(this.geometries, function(index, geometry){
            geometry = null;
        });

        Application.BasePointCloudView.prototype.destroy.call(this);
    },
    getMin: function(objarray, key){
        var min = undefined;
        $.each(objarray, function(index, item){
          var num = Number(item[key]);
          if( num < min || typeof min == 'undefined'){
            min = num;
          }
        });
        // min = Math.round(min/10)*10;
        return min;
    },
    getMax: function(objarray, key){
        var max = undefined;
        $.each(objarray, function(index, item){
          var num = Number(item[key]);
          if( num > max || typeof max == 'undefined'){
              max = num;
          }
        });
        // max = Math.round(max/10)*10;
        return max;
    },
    reset: function() {
        Application.BaseGlobeView.prototype.reset.call(this);
        this.resetPointcloud();
    },
    resetPointcloud: function() {

        var that = this;
        $.each(this.pointclouds, function(i, pointcloud){
          that.scene.remove(pointcloud);
          pointcloud = null;
        });
        this.pointclouds = [];
        $.each(that.geometries, function(i, geometry){
          geometry.dispose();
        });
        this.geometries = [];

    },
    // visualization specific functionality
    showInit: function(results){

      var that = this;
      var maxX = this.getMax(results, 'x');
      var maxY = this.getMax(results, 'y');
      var maxZ = this.getMax(results, 'z');

      var minX = this.getMin(results, 'x');
      var minY = this.getMin(results, 'y');
      var minZ = this.getMin(results, 'z');

      this.midX = (maxX+minX)/2;
      this.midY = (maxY+minY)/2;
      this.midZ = (maxZ+minZ)/2;

      var stX = (maxX - minX)/4;
      var stY = (maxY - minY)/4;
      var stZ = (maxZ - minZ)/4;

      this.ratioX = 60 / (maxX - minX);
      this.ratioY = 60 / (maxY - minY);
      this.ratioZ = 60 / (maxZ - minZ);

      //Create Legends
      var storeTexts = function(mesh){
        that.textMeshs.push(mesh);
      }
      Application.Helper.positionImageText(this.scene, Application.attrsMap['x'], 38, -30, -30, storeTexts);
      Application.Helper.positionImageText(this.scene, Application.attrsMap['z'], -30, -30, 38, storeTexts);
      Application.Helper.positionImageText(this.scene, Application.attrsMap['y'], -30, 35, -30, storeTexts);
      for(var i=0; i<5; i++){
        if(i==0){
          Application.Helper.positionImageText(this.scene, Math.round((minX+(i*stX))*100)/100, (i*15) - 25, -30, -30, storeTexts);
          Application.Helper.positionImageText(this.scene, Math.round((minZ+(i*stZ))*100)/100, -30, -30, (i*15) - 25, storeTexts);
          Application.Helper.positionImageText(this.scene, Math.round((minY+(i*stY))*100)/100, -30, (i*15) - 27, -30, storeTexts);
        }else{
          Application.Helper.positionImageText(this.scene, Math.round((minX+(i*stX))*100)/100, (i*15) - 30, -30, -30, storeTexts);
          Application.Helper.positionImageText(this.scene, Math.round((minZ+(i*stZ))*100)/100, -30, -30, (i*15) - 30, storeTexts);
          Application.Helper.positionImageText(this.scene, Math.round((minY+(i*stY))*100)/100, -30, (i*15) - 30, -30, storeTexts);
        }
      }

    },
    showResults: function(results) {

        this.resetPointcloud();

        //First time
        if (!results){
          results = this.collection[0].models;
          this.showInit(results);
          this.getCategoriesWithColors(results);
        }

        var that = this;

        Application.BasePointCloudView.prototype.showResults.call(this, results);

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        }else if( results[0].x == null && !results[0].y == null && !results[0].z == null ){
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }

        Application._vent.trigger('controlpanel/message/off');

        //Create pointclouds
        var pointcloudNum = this.categories.length || 1;
        for(var i=0; i< pointcloudNum; i++){

          this.geometries.push(new THREE.Geometry());
          var material = this.material.clone();
          if(this.categories[i]){
            material.color = new THREE.Color(this.categories[i].color);
          }

          var pointcloud = new THREE.PointCloud(this.geometries[i], material);
          pointcloud.userData.values = [];
          pointcloud.userData.x = [];
          pointcloud.userData.y = []
          pointcloud.userData.z = [];
          this.pointclouds.push(pointcloud);
          this.scene.add(pointcloud);
        }

        //Iterate each items
        $.each(results, function(index, item) {

            var v = new THREE.Vector3( item.x*that.ratioX -(that.midX*that.ratioX), item.y*that.ratioY - (that.midY*that.ratioY), item.z*that.ratioZ -(that.midZ*that.ratioZ));
            var i = 0;
            var category = that.getCategoryObj(item.category);
            if(category){
              i = category.index;
              that.pointclouds[i].userData.category = category.name;
            }
            that.geometries[i].vertices.push(v);
            that.pointclouds[i].userData.values.push(item.value);
            that.pointclouds[i].userData.x.push(item.x);
            that.pointclouds[i].userData.y.push(item.y);
            that.pointclouds[i].userData.z.push(item.z);
        });

    },
    sortResultsByCategory: function() {

        var that = this;
        Application.BaseGlobeView.prototype.sortResultsByCategory.call(this);

        if (this.activeCategories.length != 0) {
            $.each(this.pointclouds, function(index, pointcloud) {
                pointcloud.visible = false;
            });
        }else{
            $.each(this.pointclouds, function(index, pointcloud) {
                pointcloud.visible = true;
            });
        }
        $.each(this.activeCategories, function(i, category) {
            $.each(that.pointclouds, function(index, pointcloud) {
                if (pointcloud.userData.category == category) {
                    pointcloud.visible = true;
                }
            });
        });

    },
    // cameraSnap: function(obj){
    //   this.cameraGoTo(obj.cameraPos);
    // },
});
