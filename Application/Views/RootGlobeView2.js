var App = App || {};

/**
 * RootGlobeView: It would contains views of
 * Create common views
 * @return this element
 */
App.RootGlobeView2 = Backbone.View.extend({
  tagName: "div",
  template: _.template($("#rootGlobeViewTemplate").html()),

  initialize: function(options) {
    this.globeView = new App.GlobeView2();
  },
  render: function(options) {
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

    return this;
  }
});