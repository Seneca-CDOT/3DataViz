Application.ControlPanelGlobeView = Backbone.View.extend({
    tagName: 'div',
    id: 'rightcolumn',
    initialize: function() {

    },
    render: function() {
        return this;
    },
    destroy: function() {

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
        this.$el.append(this.search.render().$el);
        this.$el.append(this.tweetsbtn.render().$el);
        this.$el.append(this.resetbtn.render().$el);
        return this;
    }

});

Application.SpreadSheetControlPanel = Application.ControlPanelGlobeView.extend({

    initialize: function(obj) {
        Application.ControlPanelGlobeView.prototype.initialize.call(this);

        this._vent = obj.event;

        this.urlfield = new Application.InputField();
        this.urlfield.$el.attr('id','url');
        this.urlfield.$el.attr('class','form-control');
        this.urlfield.$el.on('mousedown', this.urlFieldAction.bind(this));

        this.submitbtn = new Application.Button();
        this.submitbtn.$el.attr('id','submit');
        this.submitbtn.$el.attr('class','btn btn-primary');
        this.submitbtn.$el[0].innerText = 'submit';
        this.submitbtn.$el.on('mousedown', this.submitAction.bind(this));

        this.resetbtn = new Application.Button();
        this.resetbtn.$el.attr('id','reset');
        this.resetbtn.$el.attr('class','btn btn-danger');
        this.resetbtn.$el[0].innerText = 'reset';
        this.resetbtn.$el.on('mousedown', this.resetAction.bind(this));
    },
    render: function() {
        Application.ControlPanelGlobeView.prototype.render.call(this);
        this.$el.append(this.urlfield.render().$el);
        this.$el.append(this.submitbtn.render().$el);
        this.$el.append(this.resetbtn.render().$el);
        return this;
    },
    urlFieldAction: function() {

    },
    submitAction: function() {

        if (this.urlfield.$el.val().trim() == '') {

            console.log(' enter the url ');
            return;
        }

        var key = this.parseKey(this.urlfield.$el.val());

        this._vent.trigger('click/submit', key);

    },
    resetAction: function() {

       this.urlfield.$el.val('');
       this._vent.trigger('click/reset');

    },
    parseKey: function(url) {

        var startindex = 0;
        var endindex = 0;

        for (var i = 0; i < url.length; i++) {


            if (url[i] === "/" && url[i + 1] === "d" && url[i + 2] === "/") {

                startindex = (i + 3);
                i = i + 3;

            }
            if (url[i] === "/" && startindex !== 0) {

                endindex = i;
            }

            if (endindex !== 0) break;
        }

        var key = url.slice(startindex, endindex);

        return key;

    }

});