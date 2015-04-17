var Application = Application || {};

// private

Application.DynamicGlobeParticle = function(dataRecord, globeRadius) {

    this._mesh = null;
    this._data = (dataRecord !== undefined) ? dataRecord : null;
    this._life_time = 0;

    this._createMesh(globeRadius);
};

Application.DynamicGlobeParticle.prototype._createMesh = function(globeRadius) {

        if (globeRadius === undefined || this._data == null) {

            return;
        }

        // sphere
        // var geometry = new THREE.SphereGeometry(0.5, 6, 6);
        // var material = new THREE.MeshPhongMaterial({
        //                         color: 0xFF0000,
        //                         ambient: 0x4396E8,
        //                         shininess: 20,
        //                         wireframe: true
        //                     });

        // cube
        var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        var material = new THREE.MeshPhongMaterial({ 
                                    color: 0xFF0000, 
                                    ambient: 0x4396E8,
                                    shininess: 20,
                                    wireframe: true 
                                });

        var particle = new THREE.Mesh(geometry, material);


        var position = Application.Helper.geoToxyz(this.getData().get("longitude"), this.getData().get("latitude"), globeRadius);
        // var position = Application.Helper.geoToxyz(this.getData().longitude, this.getData().latitude, globeRadius);

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

        this._mesh = particle;
};

// public

Application.DynamicGlobeParticle.prototype.getMesh = function() {

    return this._mesh;
};

Application.DynamicGlobeParticle.prototype.getData = function() {

    return this._data;
};

Application.DynamicGlobeParticle.prototype.setLifeTime = function(lifeTime) {

    if (lifeTime > 0 && this._life_time <= 0) {

        // var date = new Date();
        // this.getData().set("timestamp", date.getTime());

        this._life_time = lifeTime;
    }
};

Application.DynamicGlobeParticle.prototype.isDead = function(currentTime) {

    var isDead = true;
    if (this.getData() != null && currentTime !== undefined &&
        (Number(this.getData().get("timestamp")) + this._life_time > currentTime)) {

        isDead = false;
    }
    return isDead;
};
