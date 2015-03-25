var Application = Application || {};

/**
 * RootGlobeView:
 * Create common views
 * @return this element
 */
Application.RootGlobeView = Backbone.View.extend({
    tagName: "div",
    template: _.template($("#rootGlobeViewTemplate").html()),

  initialize: function(views, models) {
    this.views = [];
    for(name in views){
      if(models[name]) this[name+"Model"] = new Application[models[name]];
      this[name] = new Application[views[name]]( { model: this[name+"Model"] });
      this.views.push(this[name]);
    }
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

    for(var i=0; i<this.views.length; i++){
      this.$el.append(this.views[i].$el);
      this.views[i].render();
    }

    return this;
  }
});
