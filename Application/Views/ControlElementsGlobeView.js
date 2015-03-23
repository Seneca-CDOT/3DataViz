Application.ControlElementsGlobeView = Backbone.View.extend({
tagName: 'div',
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

Application.ControlElementsGlobeView.Search = Application.ControlElementsGlobeView.extend({

id: 'search',
initialize: function () {},
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