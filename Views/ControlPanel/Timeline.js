Application.Timeline = Backbone.View.extend({
    tagName: 'div',
    id: 'tl_timebox',
    initialize: function(points) {
        points.sort(function(a, b){return a-b});
        this.points = points;
        this.pointsObjects = []; // holds data about points
        this.initElements();
        this.appendElements();
        this.started = false; // reflects the state of timeline
        this.timerId = 0; // timerID of moving slider function
        this.cur_index = 0;
        this.distance =0; // distance between the points
        // this.SVGPlayButton = document.getElementById('playButton'); // holding a reference to SVG control  element
        // this.SVGPauseButton = document.getElementById('pauseButton'); // holding a reference to SVG control  element
        // this.SVGRestartButton = document.getElementById('restartButton'); // holding a reference to SVG control  element
        // this.SVGLine = document.getElementById('timeline');
        this.timelineLength = 0;
    },
    render: function() {

    },
    initElements: function() {

        this.$lineBox = $('<div id="tl_line"></div>');
        this.$timeline = $('<svg width="100%"><line id="timeline" x1="10" y1="25"' +
        ' x2="800" y2="25" stroke="red" fill="transparent" stroke-width="1"/></svg>');
        this.$slider = $('<div id="tl_slider"><svg height="100%"><line x1="5" y1="10"' +
        ' x2="5" y2="40" stroke="red" fill="transparent" stroke-width="2"/></svg></div>');
        this.$point = $("<div class='tl_point'><svg height='100%' width='100%'>" +
        "<circle cx='10' cy='25' r='5' stroke='red' fill='red' opacity='0.8'/></svg></div>");
        this.$pause = $("<svg width='100%'><polygon id='playButton'" +
        "points='10 10 40 25 10 40' stroke='red' fill='red' opacity='0.8'/></svg>");
        this.$play = $("<svg width='100%'><polygon id='playButton'" +
        "points='10 10 40 25 10 40' stroke='red' fill='red' opacity='0.8'/></svg>");
        this.$pause = $("<svg width='100%'><path id='pauseButton'" +
        "d='M5 10 L15 10 L15 40 L5 40 M20 10 L30 10 L30 40 L20 40' stroke='red' " +
        "fill='red' opacity='0.8'/></svg>");
        this.$control = $('<div id="tl_control"></div>');
        this.$restart = $("<svg width='100%'><path id='restartButton'" +
        "d='M10 10 L25 10  L25 15 L15 15 L15 30 L35 30 L35 15 L40 15 L40 35 L10 35'" +
        " stroke='red' fill='red' opacity='0.8'/></svg>");

    },
    appendElements: function() {

        this.$control.append(this.$play);
        this.$el.append(this.$control);
        this.$lineBox.append(this.$timeline);
        this.$lineBox.append(this.$slider);
        this.$el.append(this.$lineBox);
    },
    suscribe: function() {

        this.$control.on('mousedown', this.mouseDownControl.bind(this));
        this.$control.on('mouseover', this.mouseOverControl.bind(this));
        this.$control.on('mouseout', this.mouseOutControl.bind(this));
        $('.tl_point').on('mouseover', this.mouseOverPoint.bind(this));
        $('.tl_point').on('mousedown', this.mouseDownPoint.bind(this));
        $('.tl_point').on('mouseout', this.mouseOutPoint.bind(this));

    },
    unsuscribe: function() {

        this.$control.off('mousedown', this.mouseDownControl.bind(this));
        this.$control.off('mouseover', this.mouseOverPlay.bind(this));
        this.$control.off('mouseout', this.mouseOutPlay.bind(this));
        $('.tl_point').off('mouseover', this.mouseOverPoint.bind(this));
        $('.tl_point').off('mousedown', this.mouseDownPoint.bind(this));
        $('.tl_point').off('mouseout', this.mouseOutPoint.bind(this));

    },
    update: function() {
        this.setTimelineLength();
        this.distance = this.timelineLength / this.points.length; // distance between the points
        this.configPoints(this.points);
        this.addPoints(this.pointsObjects);
        $('#tl_timebox').css('margin-left',-($('#tl_timebox').innerWidth()/2));
        this.suscribe();
    },
    destroy: function() {

        this.unsuscribe();
        this.$slider = null;
        // this.SVGPlayButton = null;
        // this.SVGRestartButton = null;
        // this.SVGPauseButton = null;
        // this.SVGLine = null;
        this.$point = null;
        this.$pause = null;
        this.$play = null;
        this.$el.unbind();
        this.$el.remove();
    },
    configPoints: function(points) {

        for (var i = 0; i < points.length; i++) {
            var obj = {};
            obj.label = points[i];
            obj.position = this.distance * (i + 1);
            obj.index = i;
            this.pointsObjects.push(obj);
        }
    },
    addPoints: function(points) {

        var position = this.distance;
        // var position = 0;

        for (var i = 0; i < points.length; i++) {
            var $point = this.$point.clone();
            $point.data('index', i);
            this.$lineBox.append($point);
            $point.css('left', position - 5);
            $point.append(this.addLabel(points[i].label));
            position += this.distance;
        }
    },
    addLabel: function(text) {

        return $('<div class="tl_label"><svg height="30" width="50">' +
        '<text x="0" y="15" fill="white">' + text + '</text></svg></div>');

    },
    setTimelineLength: function() {
        this.timelineLength = $('#tl_line').innerWidth(); // length of timeline
        this.SVGLine = document.getElementById('timeline');
        this.SVGLine.setAttribute('x2', this.timelineLength);
    },
    addPlay: function() {

        this.$pause.remove();
        this.$restart.remove();
        this.$control.append(this.$play);
    },
    addPause: function() {

        this.$play.remove();
        this.$control.append(this.$pause);
    },
    addRestart: function() {

        this.$play.remove();
        this.$pause.remove();
        this.$control.append(this.$restart);
    },
    stop: function() {
        clearTimeout(this.timerId);
    },
    getCurPos: function() {
        return this.$slider.position().left;
    },
    moveSlider: function(distance, duration) {
        var that = this;
        var cur_pos = this.getCurPos();
        var step = distance/(duration/10);
        var traveled = this.getCurPos();

        if ( cur_pos >= 0 ) {
            Application._vent.trigger('timeline/message', that.pointsObjects[0].label);
        }

        this.timerId = setInterval(function() {
            cur_pos += step;
            that.$slider.css('left',  cur_pos);
            if (cur_pos >= that.pointsObjects[that.cur_index].position) {
                if (that.cur_index < (that.pointsObjects.length - 1) ) {
                console.log(that.pointsObjects[that.cur_index].position, that.pointsObjects[that.cur_index + 1].label);
                Application._vent.trigger('timeline/message', that.pointsObjects[that.cur_index + 1].label);
                that.cur_index++;
                traveled += distance;
            }
            }
            if (cur_pos >= (that.timelineLength)) {
                clearTimeout(that.timerId);
                that.addRestart();
                that.cur_index = 0;

            }
        }, 10);
    },

    mouseDownControl: function() {

        if (this.started) {
            clearTimeout(this.timerId);
            this.addPlay();
            this.started = false;
        }
        else {
            this.moveSlider(this.distance, 2000);
            this.addPause();
            this.started = true;
        }
        if (this.getCurPos() >= (this.timelineLength - 1)) {
            this.$slider.css('left', 0);
            this.moveSlider(this.distance, 2000);
            this.addPause();
            this.started = true;
        }
    },
    mouseOverControl: function(e) {
        e.target.setAttribute('stroke-width', 4);
    },
    mouseOutControl: function(e) {
        e.target.setAttribute('stroke-width', 1);
    },
    mouseOverPoint: function(e) {
        var circle = $(e.target)[0];
        circle.setAttribute('r', 10);
    },
    mouseOutPoint: function(e) {
        var circle = $(e.target)[0];
        circle.setAttribute('r', 5);
    },
    mouseDownPoint: function(e) {
        clearTimeout(this.timerId);
        var cur_pos = $(e.currentTarget).position().left;
        this.cur_index = $(e.currentTarget).data('index');
        this.$slider.css('left', cur_pos + 5);
        this.addPlay();
        this.started = false;
    }
});
