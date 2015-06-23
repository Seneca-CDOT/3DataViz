var Application = Application || {};

Application.DynamicLayer = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(decorator, collections) {

        Application.BaseGlobeView.prototype.initialize.call(this, decorator, collections);

        this.particles = new Application.DataStructures.List();
        this.particlesToRemove = new Application.DataStructures.List();

        // amimation
        this.timePeriod = 0;
        this.timePeriodMax = 100;

        this.delta = 0.05;

        this.lifePeriod = 100000;
        this.period = 500;
        this.particlesLifeTime = 2000;

        this.particlesTimer = null;

    },
    destroy: function() {

       // console.log("DynamicLayer Destroy");

        // TODO: review
        var iterator = this.particles.getBegin();
        while (iterator !== this.particles.getEnd()) {

            var particle = iterator.getData();
            iterator.setData(null);

            this.scene.remove(particle.getMesh());
            particle.dispose();

            iterator = iterator.getNext();
        }

        iterator = this.particlesToRemove.getBegin();
        while (iterator !== this.particlesToRemove.getEnd()) {

            var particle = iterator.getData();
            iterator.setData(null);

            this.scene.remove(particle.getMesh());
            particle.dispose();

            iterator = iterator.getNext();
        }

        this.particles.destroy();
        this.particles = null;

        this.particlesToRemove.destroy();
        this.particlesToRemove = null;


        if (this.particlesTimer) {

            clearTimeout(this.particlesTimer);
            this.particlesTimer = null;
        }
        
        Application.BaseGlobeView.prototype.destroy.call(this);
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

    onDataReceive: function(data) {

        console.log(data);

        var dataRecord = new Application.GeoDataRecord({

            "longitude": data.coordinates.coordinates[0],
            "latitude": data.coordinates.coordinates[1],
            "timestamp": data.timestamp_ms
        });

        this.addParticleWithDataRecord(dataRecord);
    },

    showResults: function(results) {

      //  console.log("DynamicLayer showResults");

        var that = this;
        this.collection[0].bind("add", function(data){
          var results = that.collection[0].models;
          that.addParticleWithDataRecord(results[results.length-1].attributes);
        });
    },

    showDataRecords: function(results, beginIndex, timeInterval) {

        if (beginIndex >= results.length) {

            // this.showDataRecords(results, 0, this.lifePeriod)
            return;
        }

        var count = 0;
        var dataRecord = results[beginIndex];
        var startTime = dataRecord.timestamp;
        var time = startTime;
        while (startTime + timeInterval > time) {

            var date = new Date();
            dataRecord.timestamp = date.getTime();

            this.addParticleWithDataRecord(dataRecord);
            ++count;
            ++beginIndex;
            if (beginIndex >= results.length)
                break;
            dataRecord = results[++beginIndex];
            time = dataRecord.timestamp;
        }

        console.log("----------------");
        console.log("Twittes Viewed: " + count + " Within Iterval Of: " + 0.001 * timeInterval + "sec.");
        console.log("Twittes Viewed Total: " + beginIndex);
        console.log("Twittes Left To View: " + (results.length - beginIndex));

        var that = this;
        this.particlesTimer = setTimeout(function() {

            that.showDataRecords(results, beginIndex, timeInterval);
        }, this.period);
    },

    // particles life cycle functionality
    addParticleWithDataRecord: function(dataRecord) {

        var particle = new Application.DynamicLayerParticle(dataRecord, this.globeRadius);
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