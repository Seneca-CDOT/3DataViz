Application.VideoView = Backbone.View.extend({
    tagName: "div",
    id: 'video',
    width: "1024px",
    heigth: "768px",

    initialize: function() {
        this.this.pop;
        this.slideChange = false; 
        document.addEventListener("DOMContentLoaded", function () {
            slider = $("#slider");
            var wrapper = this.popcorn.HTMLYouTubeVideoElement("#video");
            wrapper.src = "https://www.youtube.com/embed/Kbh9EFuFf0M";
            this.pop = this.popcorn(wrapper);
            this.pop.load();
            this.pop.on("durationchange", function(e){
                slider.attr("max", this.pop.duration());
            }, false);

            this.pop.on("timeupdate", function(){
            if(!slideChange)
              slider.val(this.currentTime());
            });

            this.pop.play();
        }, false);    
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