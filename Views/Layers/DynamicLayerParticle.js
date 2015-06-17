var Application = Application || {};

// mark - private

Application.DynamicLayerParticle = function(dataRecord, globeRadius) {

    this._mesh = null;
    this._data = (dataRecord !== undefined) ? dataRecord : null;
    this._life_time = 0;

    this._createMesh();
    this._positionMesh(globeRadius);
};

// mark - shaders

Application.DynamicLayerParticle.prototype._getVertexShader = function() {

    var shader = 
    "uniform float amplitude;" + 
    "attribute float size;" +
    "attribute vec3 customColor;" +
    "varying vec3 vColor;" +
    "void main() {" +
        "vColor = customColor;" + 
        "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );" + 
        "gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );" +
        "gl_Position = projectionMatrix * mvPosition;" +
    "}";  
    return shader;
};

Application.DynamicLayerParticle.prototype._getFragmentsShader = function() {

    var shader = 
    "uniform vec3 color;" +
    "uniform sampler2D texture;" +
    "varying vec3 vColor;" +
    "void main() {" +
        "gl_FragColor = vec4( color * vColor, 1.0 );" +
        "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );" +
    "}";  
    return shader;
};

Application.DynamicLayerParticle.prototype._getShaderMaterial = function() {

    var attributes = {

        size: { type: 'f', value: [] },
        customColor: { type: 'c', value: [] }
    };

    var uniforms = {

        amplitude: { type: "f", value: 1.0 },
        color:     { type: "c", value: new THREE.Color( 0xffffff ) }, 
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "Assets/images/sprite_spark.png" ) },
    };

    var material = new THREE.ShaderMaterial( {

        uniforms:       uniforms,
        attributes:     attributes,
        vertexShader:   this._getVertexShader(),
        fragmentShader: this._getFragmentsShader(),

        blending:       THREE.AdditiveBlending,
        depthTest:      true,
        transparent:    true
    });

    return material;
};

Application.DynamicLayerParticle.prototype._createMesh = function() {

    // var material = new THREE.MeshPhongMaterial({ 
    //                             color: 0xFF0000, 
    //                             ambient: 0x4396E8,
    //                             shininess: 20,
    //                             wireframe: true 
    //                         });
    // var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    // var geometry = new THREE.SphereGeometry(0.5, 6, 6);
    // var particle = new THREE.Mesh(geometry, material);


    var material = this._getShaderMaterial();
    var geometry = new THREE.Geometry();
    var count = 5;

    for (var v = 0; v < count; ++v) {

        var vertex = new THREE.Vector3()
        
        // vertex.x = Math.random() * 2 - 1;
        // vertex.y = Math.random() * 2 - 1;
        // vertex.z = Math.random() * 2 - 1;
        // vertex.multiplyScalar(1);

        geometry.vertices.push(vertex);
    }

    var particle = new THREE.PointCloud(geometry, material);
    this._mesh = particle;

    var vertices = particle.geometry.vertices;
    var values_size = material.attributes.size.value;
    var values_color = material.attributes.customColor.value;

    var length = vertices.length;
    for (var v = 0; v < length; ++v) {

        values_size[v] = 0;
        values_color[v] = new THREE.Color(0xff0000);
    }
};

Application.DynamicLayerParticle.prototype._positionMesh = function(globeRadius) {

    if (globeRadius === undefined || this.getData() == null) {

        return;
    }

    var particle = this.getMesh();
    var position = Application.Helper.geoToxyz(this.getData().longitude, this.getData().latitude, globeRadius);

    // compute orientation parameters
    var objectNormal = new THREE.Vector3(0, 0, 1);

    var direction = new THREE.Vector3(position.x, position.y, position.z);
    direction.normalize();

    var angle = Math.acos(direction.z);
    var axis = new THREE.Vector3();
    axis.crossVectors(objectNormal, direction);
    axis.normalize();

    var quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);

    // set orientation parameters
    var displacement = 1.04 * globeRadius;
    particle.position.set(direction.x * displacement, direction.y * displacement, direction.z * displacement);
    particle.scale.set(0, 0, 0);
    particle.rotation.setFromQuaternion(quaternion);
};

// mark - public

Application.DynamicLayerParticle.prototype.dispose = function() {

    this.getMesh().geometry.dispose();
    this.getMesh().material.dispose();
    this._mesh = null;
    this._data = null;
};

Application.DynamicLayerParticle.prototype.getMesh = function() {

    return this._mesh;
};

Application.DynamicLayerParticle.prototype.getData = function() {

    return this._data;
};

Application.DynamicLayerParticle.prototype.setLifeTime = function(lifeTime) {

    if (lifeTime > 0 && this._life_time <= 0) {

        this._life_time = lifeTime;
    }
};

Application.DynamicLayerParticle.prototype.isDead = function(currentTime) {

    var isDead = true;
    if (this.getData() != null && currentTime !== undefined &&
        (this.getData().timestamp + this._life_time > currentTime)) {

        isDead = false;
    }
    return isDead;
};

Application.DynamicLayerParticle.prototype.isVisible = function() {

    var scale = this.getMesh().scale.x;
    return scale > 0.01;
};

Application.DynamicLayerParticle.prototype.update = function(deltaScale, rotationRatio) {

    var rotation = 2 * Math.PI * rotationRatio;
    // this.getMesh().rotation.z = rotation;

    var scale = this.getMesh().scale.x; // x, y, z are equal
    if ((scale > 0.01 && deltaScale < 0.0) || (scale < 20.5 && deltaScale > 0.0)) {

        scale += deltaScale;
        this.getMesh().scale.set(scale, scale, scale);

        var attributes = this.getMesh().material.attributes;
        var length = attributes.size.value.length;
        for(var i = 0; i < length; ++i) {

            attributes.size.value[i] += (i + 1) * deltaScale;
        }
        attributes.size.needsUpdate = true;
    } else if (this.isVisible()) {

    }
};
