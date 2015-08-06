var Application = Application || {};

Application.PointCloudLayer = Application.BasePointCloudView.extend({

    // framework methods
    initialize: function(decorator, collections) {
        Application.BasePointCloudView.prototype.initialize.call(this, decorator, collections);
    },
    suscribe: function() {
        Application.BasePointCloudView.prototype.suscribe.call(this);
    },
    destroy: function() {
        Application.BasePointCloudView.prototype.destroy.call(this);
    },
    getMin: function(objarray, key){
        var min = null;
        $.each(objarray, function(index, item){
            if(item[key] < min || !min){
                min = item[key];
            }
        });
        // min = Math.round(min/10)*10;
        return Number(min);
    },
    getMax: function(objarray, key){
        var max = null;
        $.each(objarray, function(index, item){
            if(item[key] > max || !max){
                max = item[key];
            }
        });
        // max = Math.round(max/10)*10;
        return Number(max);
    },
    // visualization specific functionality
    showResults: function() {

        console.log("PointCloudLayer showResults");

        var that = this;
        var results = this.collection[0].models;

        if (results.length == 0) {
            Application._vent.trigger('controlpanel/message/on', 'NO DATA RECIEVED');
            return;
        }else if( results[0].x == null && !results[0].y == null && !results[0].z == null ){
            Application._vent.trigger('controlpanel/message/on', 'The data is not compatible with this template.<br>Please choose different data or a template');
            return;
        }

        Application._vent.trigger('controlpanel/message/off');

        var geometry = new THREE.Geometry();

        // this.attributes = {
        //     size: {type: 'f', value:[]},
        //     customColor: {type: 'c', value:[]},
        //     x: {type: 'f', value:[]},
        //     y: {type: 'f', value:[]},
        //     z: {type: 'f', value:[]}
        // }
        // this.uniforms = {
        //     texture: {type: "t", value: THREE.ImageUtils.loadTexture("/Assets/images/sprite_disc.png")}
        // }
        // var shaderMaterial = new THREE.ShaderMaterial( {
        //     attributes: this.attributes,
        //     uniforms: this.uniforms,
        //     vertexShader: document.getElementById( 'pointCloudVertexshader' ).textContent,
        //     fragmentShader: document.getElementById( 'pointCloudFragmentshader' ).textContent,
        //     // color: new THREE.Color(0xfffff),
        //     // blending: THREE.AdditiveBlending
        // } );

        var map = THREE.ImageUtils.loadTexture("Assets/images/sprite.png");
        var material = new THREE.SpriteMaterial({
            map: map,
            color: 0xffffff,
            fog: true
        });

        // Creating points random
        // var result = { x: -10000, y: 10000, z: 10000 }
        // results.push(result);
        // result = { x: 10000, y: -10000, z: -10000 }
        // results.push(result);
        //
        // for(var i=0; i < 1500; i++){
        //     var result = {
        //       x: Math.floor((Math.random()*20000) - 10000),
        //       y: Math.floor((Math.random()*20000) - 10000),
        //       z: Math.floor((Math.random()*20000) - 10000)
        //     }
        //     results.push(result);
        // }

        console.log(results);

        var maxX = this.getMax(results, 'x');
        var maxY = this.getMax(results, 'y');
        var maxZ = this.getMax(results, 'z');

        var minX = this.getMin(results, 'x');
        var minY = this.getMin(results, 'y');
        var minZ = this.getMin(results, 'z');

        var midX = (maxX+minX)/2;
        var midY = (maxY+minY)/2;
        var midZ = (maxZ+minZ)/2;

        var stX = (maxX - minX)/4;
        var stY = (maxY - minY)/4;
        var stZ = (maxZ - minZ)/4;

        var lineGeometry = new THREE.Geometry();
        for(var i=0; i<5; i++){

          if(i==0){
            Application.Helper.positionImageText(this.scene, minX+(i*stX), (i*15) - 25, -30, -30);
            Application.Helper.positionImageText(this.scene, minZ+(i*stZ), -30, -30, (i*15) - 25);
            Application.Helper.positionImageText(this.scene, minY+(i*stY), -30, (i*15) - 27, -30);
          }else{
            Application.Helper.positionImageText(this.scene, minX+(i*stX), (i*15) - 30, -30, -30);
            Application.Helper.positionImageText(this.scene, minZ+(i*stZ), -30, -30, (i*15) - 30);
            Application.Helper.positionImageText(this.scene, minY+(i*stY), -30, (i*15) - 30, -30);
          }

          for (var j=0; j<5; j++) {
		        lineGeometry.vertices.push(new THREE.Vector3( -30, (j*15)-30, -30));
            lineGeometry.vertices.push(new THREE.Vector3( 30, (j*15)-30, -30));
            lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, 30, -30));
            lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, -30, -30));

            lineGeometry.vertices.push(new THREE.Vector3( -30, -30, (j*15)-30));
            lineGeometry.vertices.push(new THREE.Vector3( 30, -30, (j*15)-30));
            lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, -30, 30));
            lineGeometry.vertices.push(new THREE.Vector3( (j*15)-30, -30, -30));

            lineGeometry.vertices.push(new THREE.Vector3(-30, -30, (j*15)-30));
            lineGeometry.vertices.push(new THREE.Vector3(-30, 30, (j*15)-30));
            lineGeometry.vertices.push(new THREE.Vector3(-30, (j*15)-30, 30));
            lineGeometry.vertices.push(new THREE.Vector3(-30, (j*15)-30, -30));
          }

        }

        var lineMaterial = new THREE.LineBasicMaterial({
    				color: 0xffffff,
    				linewidth: 0.5, // will always be 1 on windows
    				opacity: 0.5,
    				transparent: true,
    		});
    		var lineMesh =  new THREE.Line(lineGeometry, lineMaterial, THREE.LinePieces);
        this.scene.add(lineMesh);

        // Application.Helper.positionImageText(this.scene, 'X:0', 0, -55, 61);
        // Application.Helper.positionImageText(this.scene, 'X:'+maxX, 50, -55, 61);
        // Application.Helper.positionImageText(this.scene, 'X:'+(-maxX), -50, -55, 61);

        // Application.Helper.positionImageText(this.scene, 'Z:0', 61, -55, 0);
        // Application.Helper.positionImageText(this.scene, 'Z:'+maxZ, 61, -55, 50);
        // Application.Helper.positionImageText(this.scene, 'Z:'+(-maxZ), 61, -55, -50);
        //
        // Application.Helper.positionImageText(this.scene, 'Y:0', -55, 0, 61);
        // Application.Helper.positionImageText(this.scene, 'Y:'+maxY, -55, 50, 61);
        // Application.Helper.positionImageText(this.scene, 'Y:'+(-maxY), -55, -50, 61);

        var ratioX = 60 / (maxX - minX);
        var ratioY = 60 / (maxY - minY);
        var ratioZ = 60 / (maxZ - minZ);

        console.log(maxX, minX);

        var that = this;
        $.each(results, function(index, item) {
            var v = new THREE.Vector3( item.x*ratioX -(midX*ratioX), item.y*ratioY - (midY*ratioY), item.z*ratioZ -(midZ*ratioZ));
            geometry.vertices.push(v);

            // that.attributes.size.value[index] = 1;
            //
            // that.attributes.x.value[index] = item.x;
            // that.attributes.y.value[index] = item.y;
            // that.attributes.z.value[index] = item.z;

            // Coloring
            // var g = Math.ceil((item.x + 250)/500.0*255);
            // var b = Math.ceil((item.y + 250)/500.0*255);
            // var r = Math.ceil((item.z + 250)/500.0*255);
            // that.attributes.customColor.value[index] = new THREE.Color("rgb("+r+","+g+","+b+")");
            // that.attributes.customColor.value[index] = new THREE.Color(0xaaaaaa);
            // that.attributes.size.needsUpdate = true;
        });

        this.pointcloud = new THREE.PointCloud(geometry);
        this.scene.add(this.pointcloud);

    }
});
