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
render: function() {
	Application.ControlPanelGlobeView.prototype.render.call(this);
	this.$el.append( this.search.render().$el );
	this.$el.append( this.tweetsbtn.render().$el );
	this.$el.append( this.resetbtn.render().$el );
	return this;
}

});

Application.SpreadSheetControlPanel = Application.ControlPanelGlobeView.extend({

initialize: function() {
    Application.ControlPanelGlobeView.prototype.initialize.call(this);

    this._vent = _.extend({}, Backbone.Events);
	
	this.urlfield = new Application.InputField();
	this.urlfield.$el[0].id ='url';
	this.urlfield.$el[0].className = 'form-control';
	this.urlfield.$el.on('mousedown', this.urlFieldAction.bind(this));
	
	this.submitbtn = new Application.Button();
	this.submitbtn.$el[0].id = 'submit';
    this.submitbtn.$el[0].className = 'btn btn-primary';
    this.submitbtn.$el[0].innerText = 'submit';
    this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

	this.resetbtn = new Application.Button();
	this.resetbtn.$el[0].id = 'reset';
    this.resetbtn.$el[0].className = 'btn btn-danger';
    this.resetbtn.$el[0].innerText = 'reset';
    this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
},
render: function() {
	Application.ControlPanelGlobeView.prototype.render.call(this);
	this.$el.append( this.urlfield.render().$el );
	this.$el.append( this.submitbtn.render().$el );
	this.$el.append( this.resetbtn.render().$el );
	return this;
},
urlFieldAction: function () {


},
submitAction: function () {

this._vent.trigger('click/submit');

},
resetAction: function () {

this._vent.trigger('click/reset');

}

});