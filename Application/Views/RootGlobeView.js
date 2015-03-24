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
      var obj = {};
      if(models[name]) obj.model = Application[models[name]];
      this[name] = new Application[views[name]](obj);
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
