Application.ControlPanelGlobeView = Backbone.View.extend({
tagName: 'div',
id: 'rightcolumn',
intialize: function() {},
render: function () {
	return this;
},
destroy: function () {

	this.remove();
	this.unbind();
	delete this.$el;
	delete this.el;
}

});