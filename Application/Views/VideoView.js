var pop;
Application.VideoView = Backbone.View.extend({
    tagName: "div",
    id: 'video',

    initialize: function() {
        this.pop;
        this.slideChange = false;
        this.slider;
    },
    render: function () {
        // var html = '<div id="video"></div>'
        // $(this.el).html(html);
        $(document).ready(function(){
        // if( $("#video").length ){
            slider = $("#slider");
            this.wrapper = Popcorn.HTMLYouTubeVideoElement("#video");
            this.wrapper.src = "https://www.youtube.com/embed/Kbh9EFuFf0M";
            this.pop = Popcorn(this.wrapper);
            this.pop.load();
            pop = this.pop;
            console.log(this.pop);
            this.pop.on("durationchange", function(e){
                slider.attr("max", this.pop.duration());
            }, false);

            this.pop.on("timeupdate", function(){
            if(!slideChange)
              slider.val(this.currentTime());
            });
        // }
        });
        return this;
    },
    destroy: function () {
        this.remove();
        this.unbind();
        delete this.$el;
        delete this.el;
    }
});