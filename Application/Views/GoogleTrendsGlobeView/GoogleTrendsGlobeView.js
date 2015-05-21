var Application = Application || {};

Application.GoogleTrendsGlobeView = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function(config) {

        Application.BaseGlobeView.prototype.initialize.call(this, config);
        this.countries = [];
        this.timer; // represents timer for user mouse idle
        this.idle = true; // represents user mouse idle
        this.intersected; // intersected mesh
        this.moved = false; // for controls and mouse events
        this.sprites = [];
        this.suscribe();

        this.collection.fetch();
        
    },
    render: function() {

        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    },
    suscribe: function() {

        Application._vent.on('click/submit', this.submit.bind(this));
        Application._vent.on('click/reset', this.resetGlobe.bind(this));
        Application._vent.on('data/parsed', this.notifyDecorator.bind(this));
        
    },
    submit: function(key) {

        this.collection.setURL(key);
        this.collection.reset();
        this.resetGlobe();
        this.collection.request();

        console.clear();
    },
    resetGlobe: function() {

        var that = this;
        $.each(that.added, function(index, country) {

            country.mesh.material.color.setHex(country.color);
        });
    },

    // visualization specific functionality
    cameraGoTo: function(countrymesh) {

        Application.BaseGlobeView.prototype.cameraGoTo.call(this, countrymesh);
    },
    notifyDecorator: function(data) {

    Application._vent.trigger('data/ready', data);

    }

});
