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

    getMax: function(objarray, key){
        var max = 0;
        $.each(objarray, function(index, item){
            if(Math.abs(item[key]) > max){
                max = Math.abs(item[key]);
            }
        });
        return max;
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
        this.attributes = {
            size: {type: 'f', value:[]},
            customColor: {type: 'c', value:[]},
            x: {type: 'f', value:[]},
            y: {type: 'f', value:[]},
            z: {type: 'f', value:[]}
        }
        this.uniforms = {
            texture: {type: "t", value: THREE.ImageUtils.loadTexture("/Assets/images/sprite_disc.png")}
        }
        var shaderMaterial = new THREE.ShaderMaterial( {
            attributes: this.attributes,
            uniforms: this.uniforms,
            vertexShader: document.getElementById( 'pointCloudVertexshader' ).textContent,
            fragmentShader: document.getElementById( 'pointCloudFragmentshader' ).textContent,
            // color: new THREE.Color(0xfffff),
            // blending: THREE.AdditiveBlending
        } );

        // Creating points random
        var results = [];
        for(var i=0; i < 500; i++){
            var result = {
              x: Math.floor((Math.random()*20000) - 10000),
              y: Math.floor((Math.random()*10000) - 5000),
              z: Math.floor((Math.random()*500) - 250)
            }
            results.push(result);
        }

        var maxX = this.getMax(results, 'x');
        var maxY = this.getMax(results, 'y');
        var maxZ = this.getMax(results, 'z');

        Application.Helper.positionImageText(this.scene, 'X:0', 0, -55, 61);
        Application.Helper.positionImageText(this.scene, 'X:'+maxX, 50, -55, 61);
        Application.Helper.positionImageText(this.scene, 'X:'+(-maxX), -50, -55, 61);

        Application.Helper.positionImageText(this.scene, 'Z:0', 61, -55, 0);
        Application.Helper.positionImageText(this.scene, 'Z:'+maxZ, 61, -55, 50);
        Application.Helper.positionImageText(this.scene, 'Z:'+(-maxZ), 61, -55, -50);

        Application.Helper.positionImageText(this.scene, 'Y:0', -55, 0, 61);
        Application.Helper.positionImageText(this.scene, 'Y:'+maxY, -55, 50, 61);
        Application.Helper.positionImageText(this.scene, 'Y:'+(-maxY), -55, -50, 61);

        var ratioX = 60 / maxX;
        var ratioY = 60 / maxY;
        var ratioZ = 60 / maxZ;

        var that = this;
        $.each(results, function(index, item) {
            var v = new THREE.Vector3(Math.ceil(item.x * ratioX), Math.ceil(item.y * ratioY), Math.ceil(item.z * ratioZ));
            geometry.vertices.push(v);
            that.attributes.size.value[index] = 1;

            that.attributes.x.value[index] = item.x;
            that.attributes.y.value[index] = item.y;
            that.attributes.z.value[index] = item.z;
            
            // Coloring
            // var g = Math.ceil((item.x + 250)/500.0*255);
            // var b = Math.ceil((item.y + 250)/500.0*255);
            // var r = Math.ceil((item.z + 250)/500.0*255);
            // that.attributes.customColor.value[index] = new THREE.Color("rgb("+r+","+g+","+b+")");
            that.attributes.customColor.value[index] = new THREE.Color(0xaaaaaa);
            that.attributes.size.needsUpdate = true;
        });
 
        this.pointcloud = new THREE.PointCloud(geometry, shaderMaterial);
        this.scene.add(this.pointcloud);

    }
});