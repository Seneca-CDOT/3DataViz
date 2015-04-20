Application.SliderControlView = Backbone.View.extend({
	intialize: function() {},
	render: function () {
		var html = '<input type="range" id="slider" name="slider" max="100" min="0" step="1">'
		$(this.el).html(html);
		return this;
	},

	events :{
		// 'mousedown': 'onMouseDown',
		// 'mouseup'  : 'onMouseUp',
		'click'	   : 'onClick',
	},
	onClick: function(e){
        e.stopPropagation();
        //TODO: find a way to integrate slider with popcorn video
		pop.pop.pause();
        pop.slideChange = true;
        pop.currentTime(this.$el.val());
        pop.pop.play();
        pop.slideChange = false;

	},
	destroy: function () {
		this.remove();
		this.unbind();
		delete this.$el;
		delete this.el;
	}
});