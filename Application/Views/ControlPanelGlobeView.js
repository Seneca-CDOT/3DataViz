Application.ControlPanelGlobeView = Backbone.View.extend({
tagName: 'div',
id: 'rightcolumn',
initialize: function() {

},
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


Application.StaticTwitterControlPanel = Application.ControlPanelGlobeView.extend({

initialize: function() {
    Application.ControlPanelGlobeView.prototype.initialize.call(this);
	this.search = new Application.SearchField();
	this.tweetsbtn = new Application.TweetsButton();
	this.resetbtn = new Application.ResetButton();
},
render: function () {
	Application.ControlPanelGlobeView.prototype.render.call(this);
	this.$el.append( this.search.render().$el );
	this.$el.append( this.tweetsbtn.render().$el );
	this.$el.append( this.resetbtn.render().$el );
	return this;
}



});