Application.InstructionView = Backbone.View.extend({
  tagName:'div',
  id: 'frame',
  initialize: function() {
    var that = this;
    $.get('Templates/instruction.html', function(data) {
      template = _.template(data, {});
      that.$el.html(template);
      $('body').prepend(that.$el);
    }, 'html');
  },
  render: function() {}
});
