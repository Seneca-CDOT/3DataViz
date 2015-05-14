var Application = Application || {};

Application.DynamicGlobeView = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function() {

        Application.BaseGlobeView.prototype.initialize.call(this);

        this.particles = new Application.DataStructures.List();
        this.particlesToRemove = new Application.DataStructures.List();

        // amimation
        this.timePeriod = 0;
        this.timePeriodMax = 100;

        this.delta = 0.05;

        this.lifePeriod = 100000;
        this.period = 500;
        this.particlesLifeTime = 2000;
    },

    // visualization specific functionality
    updateGlobe: function() {

        Application.BaseGlobeView.prototype.updateGlobe.call(this);

        this.updateParticles();
    },
    updateParticles: function() {
        this.removeParticleIfNeeded();

        ++this.timePeriod;
        if (this.timePeriod > this.timePeriodMax) {
            this.timePeriod = 0;
        }
        var ratio = this.timePeriod / this.timePeriodMax;

        var iterator = this.particles.getBegin();
        while (iterator !== this.particles.getEnd()) {

            var particle = iterator.getData();
            particle.update(this.delta, ratio);

            iterator = iterator.getNext();
        }

        var canRemove = true;
        iterator = this.particlesToRemove.getBegin();
        while (iterator !== this.particlesToRemove.getEnd()) {

            var particle = iterator.getData();
            particle.update(-this.delta, ratio);

            if (particle.isVisible()) {

                iterator = iterator.getNext();

                // TODO:
                // canRemove = false;
            } else if (canRemove) {

                this.scene.remove(particle.getMesh());
                particle.dispose();

                // TODO:
                iterator = this.particlesToRemove.removeNode(iterator);
                // if (iterator === this.particlesToRemove.getBegin()) {

                //     iterator = this.particlesToRemove.popFront(iterator);
                // } else {

                //     throw 'Particles should be removed in chronological order';
                // }
            }
        }
    },
    addHelpers: function() {

        Application.BaseGlobeView.prototype.addHelpers.call(this);

        Application.Debug.addAxes(this.globe);
    },

    // streaming functionality
    // TODO: move to model
    // <script src="http://localhost:8080/socket.io/socket.io.js"></script>    
    startDataStreaming: function() {

        var obj = {};
        // obj.track = "morning";
        obj.track = "love";
        // obj.language = "en";

        this.socket = io('http://localhost:8080');
        this.socket.on('tweet', this.onDataReceive.bind(this));
        // this.socket.off('tweet', ...);

        this.socket.emit('start', obj);
    },
    onDataReceive: function(data) {

        console.log(data);

        var dataRecord = new Application.GeoDataRecord({

            "longitude": data.coordinates.coordinates[0],
            "latitude": data.coordinates.coordinates[1],
            "timestamp": data.timestamp_ms
        });

        this.addParticleWithDataRecord(dataRecord);
    },

    // db synchronization and vizualization functionality
    // this.startDataStreaming();
    startDataSynchronization: function() {

        var that = this;
        this.collection.reset();
        this.collection.fetch().done(function() {

            that.showDataRecords(0, that.lifePeriod);
        });
    },
    showDataRecords: function(beginIndex, timeInterval) {

        if (beginIndex >= this.collection.length) {

            this.startDataSynchronization();
            return;
        }

        var count = 0;
        var dataRecord = this.collection.at(beginIndex);
        var startTime = dataRecord.get("timestamp");
        var time = startTime;
        while (startTime + timeInterval > time) {

            var date = new Date();
            dataRecord.set("timestamp", date.getTime());

            this.addParticleWithDataRecord(dataRecord);
            ++count;
            ++beginIndex;
            if (beginIndex >= this.collection.length)
                break;
            dataRecord = this.collection.at(++beginIndex);
            time = dataRecord.get("timestamp");
        }

        console.log("----------------");
        console.log("Twittes Viewed: " + count + " Within Iterval Of: " + 0.001 * timeInterval + "sec.");
        console.log("Twittes Viewed Total: " + beginIndex);
        console.log("Twittes Left To View: " + (this.collection.length - beginIndex));

        var that = this;
        setTimeout(function() {

            that.showDataRecords(beginIndex, timeInterval);
        }, this.period);
    },

    // particles life cycle functionality
    addParticleWithDataRecord: function(dataRecord) {

        var particle = new Application.DynamicGlobeParticle(dataRecord, this.globeRadius);
        particle.setLifeTime(this.particlesLifeTime);

        // Application.Debug.addAxes(particle.getMesh());

        this.scene.add(particle.getMesh());
        this.particles.pushBack(particle);
    },
    removeParticleIfNeeded: function() {

        var date = new Date();

        var iterator = this.particles.getBegin();
        while (iterator !== this.particles.getEnd()) {

            var particle = iterator.getData();
            if (particle.isDead(date.getTime())) {

                this.particlesToRemove.pushBack(particle);

                // TODO:
                iterator = this.particles.removeNode(iterator);
                // if (iterator === this.particles.getBegin()) {

                //     iterator = this.particles.popFront(iterator);
                // } else {

                //     throw 'Particles should be removed in chronological order';
                // }
            } else {

                break;
            }
        }
    }
});
