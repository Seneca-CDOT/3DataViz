var Application = Application || {};

/**
 * RootGlobeView:
 * Create common views
 * @return this element
 */
Application.RootGlobeView = Backbone.View.extend({
  tagName: "div",
  template: _.template($("#rootGlobeViewTemplate").html()),

  initialize: function(view) {
    this.globeView = view;
  },
  render: function(options) {

    console.log("RootGlobeView: render");
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
