var Application = Application || {};

Application.BaseDataRecord = Backbone.Model.extend({
    defaults: {

        timestamp: 0
    },
    initialize: function() {}
});

Application.GeoDataRecord = Application.BaseDataRecord.extend({

    defaults: _.extend({}, Application.BaseDataRecord.prototype.defaults, {
        longitude: 0,
        latitude: 0,
        city: ""
    }),
    initialize: function() {
        Application.BaseDataRecord.prototype.initialize.call(this);
    }
});

Application.BaseGlobeCollection = Backbone.Collection.extend({
    initialize: function() {},
    //TODO Depends on data attributes provided by users, 
    // this will choose vizualize layer options.
    getViewConfigs: function(data, defaults){
        return defaults;
    }
});