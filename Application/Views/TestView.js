var Application = Application || {};
Application.TestView = Backbone.View.extend({

  tagName: "div",
  template: _.template( $("#testElement").html() ),

  render: function() {
    var testElement = this.template();
    this.$el.html(testElement);
    return this;
  }

});