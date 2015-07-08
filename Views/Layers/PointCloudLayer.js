var Application = Application || {};

Application.PointCloudLayer = Application.BasePointCloudView.extend({

    // framework methods
    initialize: function(decorator, collections) {
        Application.BasePointCloudView.prototype.initialize.call(this, decorator, collections);
        // this._vent = config._vent;
        //this.countries = [];
        //this.intersected; // intersected mesh
        //this.moved = false; // for controls and mouse events
        //this.timer; // represents timer for user mouse idle
        //this.idle = true; // represents user mouse idle
        this.sprites = [];
        //this.suscribe();
        //this.collection = config.collection[0];


    },
    suscribe: function() {

        Application.BasePointCloudView.prototype.suscribe.call(this);
        //Application._vent.on('data/ready', this.showResults.bind(this));
        //Application._vent.on('globe/ready', this.processRequest.bind(this));
    },
    destroy: function() {

        console.log("PointCloudLayer Destroy");

        Application.BasePointCloudView.prototype.destroy.call(this);
        // Application._vent.unbind('globe/ready');
        this.sprites = null;
        // Application._vent.unbind('globe/ready');
    },
    // member methods
    resetGlobe: function() {

        var that = this;
        this.sprites.forEach(function(sprite) {

            that.scene.remove(sprite);

            sprite.geometry.dispose();
            sprite.material.dispose();
        });
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
        var map = THREE.ImageUtils.loadTexture("Assets/images/sprite.png");

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
            vertexShader: document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent
        } );

        //Creating points random
        // var results = [];
        // for(var i=0; i < 10000; i++){
        //     var result = {
        //       x: Math.floor((Math.random()*20000) - 10000),
        //       y: Math.floor((Math.random()*20000) - 10000),
        //       z: Math.floor((Math.random()*20000) - 10000)
        //     }
        //     results.push(result);
        // }

        var max = this.getMax(results);
        console.log(max);


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