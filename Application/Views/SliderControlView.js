Application.SliderControleView = Backbone.View.extend({
	tagName: 'input',
	type: 'range',
	name:'slider',
	id:'slider',
	max:100,
	step:1,
	intialize: function() {},
	render: function () {
		return this;
	},

	events :{
		'mousedown': 'down',
		'mouseup'  : 'up',
		'click'	   : 'changeTime',
	},
	changeTime: function(e){
		Application.ControlElementsGlobeView.prototype.action.call(this);

        e.stopPropagation();
        //TODO: find a way to integrate slider with popcorn video
		pop.pop.pause();
        pop.slideChange = true;
        pop.currentTime(this.$el.val());
        pop.pop.play();
        pop.slideChange = false;

	}
	destroy: function () {
		this.remove();
		this.unbind();
		delete this.$el;
		delete this.el;
	}
});