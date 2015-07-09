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

    getMax: function(objarray){
        var max = 0;
        $.each(objarray, function(index, item){
            if(Math.abs(item.x) > max){
                max = Math.abs(item.x);
            }
            if(Math.abs(item.y) > max){
                max = Math.abs(item.y);
            }
            if(Math.abs(item.z) > max){
                max = Math.abs(item.z);
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
            fragmentShader: document.getElementById( 'pointCloudFragmentshader' ).textContent
        } );

        // Creating points random
        var results = [];
        for(var i=0; i < 10000; i++){
            var result = {
              x: Math.floor((Math.random()*20000) - 10000),
              y: Math.floor((Math.random()*20000) - 10000),
              z: Math.floor((Math.random()*20000) - 10000)
            }
            results.push(result);
        }

        var max = this.getMax(results);
        console.log(max);

        //var sprite = new THREE.ImageUtils.loadTexture("/Assets/images/text.svg");
        //var sprite = THREE.ImageUtils.loadTexture( '<svg id="svgText" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" height="600" width="600" viewBox="0 0 600 600"><text x="0" y="300" fill="red" font-size="100">I love SVG!</text></svg>' );
        
        // this.sprite = new Image();
        // var svg = "data:image/svg+xml;utf8," + '<svg id="svgText" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" height="600" width="600" viewBox="0 0 600 600"><text x="0" y="300" fill="red" font-size="100">I love SVG!</text></svg>';
        // // var svg = '/Assets/images/text.svg'; 
        // this.sprite.src = svg;
        // this.mesh;
        // this.sprite.onload = function(){
        //     console.log(this);
        //     var sp = new THREE.SpriteMaterial({
        //         map: this,
        //         color: 0xffffff
        //     });
        //     that.mesh = new THREE.Sprite(sp);
        //     that.mesh.scale.multiplyScalar(50);
        //     that.scene.add(that.mesh);
        // };
        
        // this.sprite.addEventListener('load', function () {
        //     console.log("image onload");
        //     ctx.drawImage(this, 0, 0);     
        //     domURL.revokeObjectURL(url);
        //     callback(this);
        // });

        // var element = document.getElementById('svgText');
        // console.log(element);
        // var cssObject = new THREE.CSS3DObject( element );
        // cssObject.position = planeMesh.position;
        // cssObject.rotation = planeMesh.rotation;
        // this.scene.add(cssObject);


        var ratio = 60 / max;

        var that = this;
        $.each(results, function(index, item) {
            var v = new THREE.Vector3(Math.ceil(item.x * ratio), Math.ceil(item.y * ratio), Math.ceil(item.z * ratio));
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
            that.attributes.customColor.value[index] = new THREE.Color(0xffffff);
            that.attributes.size.needsUpdate = true;
        });
 
        this.pointcloud = new THREE.PointCloud(geometry, shaderMaterial);
        this.scene.add(this.pointcloud);

    }
});