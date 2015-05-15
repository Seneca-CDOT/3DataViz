var Application = Application || {};

/**
 * RootView:
 * Create common views
 * @return this element
 */
Application.RootView = Backbone.View.extend({
    tagName: "div",

    initialize: function() {
        this._vent = _.extend({}, Backbone.Events);
        this.controlPanel = new Application.ControlPanelGlobeView(this._vent);

        /* Example */
        this._vent.on('controls/datasource', function(data) {
            console.log(data)
        });
        this._vent.on('controls/visualization', function(data) {
            console.log(data)
        });
        this._vent.on('controls/datalayer', function(data) {
            console.log(data)
        });
    },
    render: function() {

        this.$el.append(this.controlPanel.render().$el);

        return this;
    }




















});