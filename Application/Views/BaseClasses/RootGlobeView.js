var Application = Application || {};

/**
 * RootGlobeView:
 * Create common views
 * @return this element
 */
Application.RootGlobeView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#rootGlobeViewTemplate").html()),

  initialize: function() {
    this._vent = _.extend({}, Backbone.Events);
    this.controlPanel = new Application.ControlPanelGlobeView(this._vent);

  },
  render: function() {

    var options = {
      origin: {
        x: 0,
        y: 0
      },
      size: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    this.globeView.options = options;

    this.$el.append(this.globeView.$el);
    this.globeView.render();

    this.$el.append(this.controlPanel.render().$el);

    // for(var i=0; i<this.views.length; i++){
    //   this.$el.append(this.views[i].$el);
    //   this.views[i].render();
    // }

    return this;
  }
});
