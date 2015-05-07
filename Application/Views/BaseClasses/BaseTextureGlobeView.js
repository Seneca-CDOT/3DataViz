var Application = Application || {};

Application.BaseTextureGlobeView = Application.BaseGlobeView.extend({

    // framework methods
    initialize: function() {

        Application.BaseGlobeView.prototype.initialize.call(this);
    },
    render: function() {

        Application.BaseGlobeView.prototype.render.call(this);
        return this;
    }

    // member methods
    // ...
});