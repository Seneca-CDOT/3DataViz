Application.Matcher = Backbone.View.extend({
    tagName: 'div',
    id: 'matcherBox',
    initialize: function() {
        Application.attrsMap = {}; // a map of attributes
        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';

        this.appendTitleBox();
        this.templatesView = new Application.TemplatesView();
        this.attributesView =  new Application.AttributesView();

        this.userAttributesView = new Application.UserAttributesSet(Application.attrsMap);
        this.parserAttributesView = new Application.ParserAttributesSet(Application.attrsMap);

        this.submit = new Application.SubmitAttrs();
        this.submit.$el.on('click', this.action.bind(this));
        Application._vent.on('matcher/on', this.showMatcher, this);
        Application._vent.on('matcher/off', this.hideMatcher, this);
        Application._vent.on('matcher/user/add', this.setUserAttribute, this);
        Application._vent.on('matcher/parser/add', this.setParserAttribute, this);
        Application._vent.on('matcher/user/remove', this.removeUserAttribute, this);
        Application._vent.on('matcher/parser/remove', this.removeParserAttribute, this);
        Application._vent.on('controlpanel/subview/vizLayer', this.resetAttributes, this);
        this.hideMatcher();
    },
    render: function() {
        this.$el.append(this.templatesView.render().$el);
        var attributesViewEl = this.attributesView.render().$el;
        this.$el.append(attributesViewEl);
        $('.SetColumns', attributesViewEl).append(this.userAttributesView.render().$el);
        $('.SetColumns', attributesViewEl).append(this.parserAttributesView.render().$el);
        this.$el.append(this.labelForTemplates);
        this.$el.append(this.submit.render().$el);

        return this;
    },
    appendTitleBox: function(){
        var $box = $('<div class="matcherBoxInner"></div>');
        $box.append('<div class="heading">Title<p>We will put some explanation here</p><div/>')
        $box.append('<input class="form-control vizTitle">');
        this.$el.append($box);
    },
    resetAttributes: function() {

        for (var member in Application.attrsMap) delete Application.attrsMap[member];
    },
    showMatcher: function() {

        this.$el.show();
    },
    hideMatcher: function() {

        this.$el.hide();
    },
    setUserAttribute: function(attr) {

        this.lastUserPropName = attr;

    },
    removeUserAttribute: function(attr) {

        Application.attrsMap[this.lastParserPropName] = '';

    },
    setParserAttribute: function(attr) {

        Application.attrsMap[attr] = this.lastUserPropName;
        this.lastParserPropertyName = attr;

    },
    removeParserAttribute: function(attr) {

        delete Application.attrsMap[attr];
    },
    action: function() {

        Application._vent.trigger('matcher/submit');
        Application._vent.trigger('matcher/off');

    },
    destroy: function() {

        this.userAttributesView.destroy();
        this.parserAttributesView.destroy();
        this.templatesView.destroy();
        this.templatesView = null;
        this.userAttributesView = null;
        this.parserAttributeView = null;
        Application._vent.unbind('matcher/on', this.showMatcher);
        Application._vent.unbind('matcher/off', this.hideMatcher);
        Application._vent.unbind('matcher/user/add', this.setUserAttribute);
        Application._vent.unbind('matcher/parser/add', this.setParserAttribute);
        Application._vent.unbind('matcher/user/remove', this.removeUserAttribute);
        Application._vent.unbind('matcher/parser/remove', this.removeParserAttribute);
        this.submit.destroy();
        this.submit = null;
    }
});


Application.AttributesSet = Backbone.View.extend({
    tagName: 'div',
    initialize: function(attrsMap) {
        this.checkboxes = []; // array of checkboxes
        Application.attrsMap = attrsMap;
        this.inactiveColor = '#79839F';
        this.activeColor = '#FFFFFF';
        this.checkedColor = '#79839F';
        this.uncheckedColor = '';
        this.chosenColor = '#40405C';
    },
    render: function() {

        return this;
    },
    listAttributes: function(list) {
        var that = this;

        if (this.checkboxes != null) {
            this.removeCheckboxes();
        }

        $.each(list, function(index, name) {

            //  if (index != '_length') {

            var checkbox = that.createCheckBox(name);

            that.$el.append(checkbox);
            //}

        });

    },
    action: function(e) {

        var checked = $(e.target).data('checked');

        if (checked == 'false') {

            $(e.target).data('checked', 'true'); // makes button checked

            Application._vent.trigger(this.eventName + '/add', e.target.innerText);

            $(e.target).css('background-color', this.checkedColor); // changes color to grey when checked

            Application._vent.trigger(this.eventName + '/click', e.target.innerText);

            this.makeInactiveTheRest();

        } else if (checked == 'true') {

            $(e.target).data('checked', 'false');

            Application._vent.trigger(this.eventName + '/unclick', e.target.innerText);

            $(e.target).css('background-color', this.uncheckedColor);

            Application._vent.trigger(this.eventName + '/remove', e.target.innerText);

            this.makeActiveTheRest();

        } else {

            console.log("Couldn't check if the target was checked", e);
        }

    },

    makeActiveTheRest: function() {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            if (box.data('checked') == 'false') {

                box.css('color', that.activeColor);

                box.click(that.action.bind(that));
            }

        });

    },
    makeInactiveTheRest: function() {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            if (box.data('checked') == 'false') {

                box.css('color', that.inactiveColor);

                box.unbind();
            }


        });

    },
    createCheckBox: function(name) {

        var $box = $('<button class="checkbox">'+name+'</button>');

        $box.attr('id', '_' + name);

        $box.data('checked', 'false');

        $box.name = name;

        this.checkboxes.push($box);

        $box.click(this.action.bind(this));

        return $box;

    },
    findPairByKey: function(attr) {

        return Application.attrsMap[attr];

    },
    findPairByValue: function(attr) {

        return _.invert(Application.attrsMap)[attr];

    },
    getCheckbox: function(name) {

        for (var i = 0; i < this.checkboxes.length; i++) {

            if (name == this.checkboxes[i].name) return this.checkboxes[i];
        }
    },
    removeCheckboxes: function() {

        $.each(this.checkboxes, function(index, checkbox) {

            checkbox.unbind();
            checkbox.remove();
            checkbox = null;

        });

        this.checkboxes.length = 0;

    },
    destroy: function() {

        this.removeCheckboxes();
        this.checkboxes = null;
        //Application.attrsMap = null;
        this.inactiveColor = null;
        this.activeColor = null;
        this.checkedColor = null;
        this.uncheckedColor = null;
        this.chosenColor = null;
    }


});



Application.UserAttributesSet = Application.AttributesSet.extend({
    className: 'SetColumn',
    initialize: function(attrsMap) {
        this.eventName = 'matcher/user';
        Application.AttributesSet.prototype.initialize.call(this, attrsMap);
        Application._vent.on(this.eventName, this.listAttributes, this);
        // Application._vent.on('controlpanel/subview/vizLayer', this.resetAttributes, this);
        Application._vent.on('matcher/parser/click', this.makeActiveTheRest, this);
        Application._vent.on('matcher/parser/click', this.setAttributeChosen, this);
        Application._vent.on('matcher/on', this.suscribe, this);
        Application._vent.on('matcher/off', this.unsuscribe, this);
        Application._vent.on('matcher/parser/unclick', this.unsetAttributeChosen, this);
        this.lastChoice; // last choice of userSet
        this.list; // last list of user attributes
        this.templateIsChosen = false;

    },
    action: function(e) {

        Application.AttributesSet.prototype.action.call(this, e);

        var checked = $(e.target).data('checked');

        if (checked == 'true') {

            this.lastChoice = $(e.target);
        }

    },
    setAttributeChosen: function(ParserAttr) {

        var attr = this.findPairByKey(ParserAttr);
        var box = this.getCheckbox(attr);

        $(box).css('background-color', this.chosenColor);
        $(box).unbind();
    },
    unsetAttributeChosen: function(ParserAttr) {

        var attr = this.findPairByKey(ParserAttr);
        var box = this.getCheckbox(attr);

        $(box).css('background-color', this.checkedColor);
        $(box).click(this.action.bind(this));
        this.makeInactiveTheRest();
        Application._vent.trigger('matcher/user/add', attr);
    },
    render: function() {

        Application.AttributesSet.prototype.render.call(this);

        return this;
    },
    suscribe: function() {

        Application._vent.on('controlpanel/subview/vizLayer', this.resetAttributes, this);
        this.resetAttributes();
    },
    resetAttributes: function() {

        if (this.templateIsChosen) {
            this.listAttributes(this.list);
            this.makeActiveTheRest();
        }
        this.templateIsChosen = true;

    },
    listAttributes: function(list) {

        if ({}.toString.call(list) == '[object Object]') list = _.keys(list);

        Application.AttributesSet.prototype.listAttributes.call(this, list);
        this.makeInactiveTheRest();

        this.list = list;
    },
    unsuscribe: function() {
        Application._vent.unbind('controlpanel/subview/vizLayer', this.listAttributes);
    },
    destroy: function() {

        Application.AttributesSet.prototype.destroy.call(this);
    },
});

Application.ParserAttributesSet = Application.AttributesSet.extend({
    className: 'SetColumn',
    initialize: function(attrsMap) {
        this.eventName = 'matcher/parser';
        Application.AttributesSet.prototype.initialize.call(this, attrsMap);
        // Application._vent.on('controlpanel/subview/vizLayer', this.listAttributes, this);
        Application._vent.on('matcher/on', this.suscribe, this);
        Application._vent.on('matcher/off', this.unsuscribe, this);
        Application._vent.on('matcher/user/click', this.makeActiveTheRest, this);
        Application._vent.on('matcher/parser/click', this.setAttributeChosen, this);
        Application._vent.on('matcher/parser/unclick', this.unsetAttributeChosen, this);

        this.templateChosen = false;

    },
    render: function() {
        Application.AttributesSet.prototype.render.call(this);

        return this;
    },
    setAttributeChosen: function(attr) {

        var box = this.getCheckbox(attr);

        $(box).css('background-color', this.chosenColor);

    },
    unsetAttributeChosen: function(attr) {

        var box = this.getCheckbox(attr);

        $(box).css('background-color', this.uncheckedColor);

        $(box).data('checked', 'false');

    },
    suscribe: function() {

        Application._vent.on('controlpanel/subview/vizLayer', this.listAttributes, this);
        this.resetAttributes();
    },
    resetAttributes: function() {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            that.unsetAttributeChosen(box.name);
        });

    },
    listAttributes: function(template) {

        this.list = Application.templates[template].default;

        Application.AttributesSet.prototype.listAttributes.call(this, this.list);
        this.makeInactiveTheRest();
        this.templateIsChosen = true;
    },
    unsuscribe: function() {
        Application._vent.unbind('controlpanel/subview/vizLayer', this.listAttributes);
    },
    destroy: function() {
        Application.AttributesSet.prototype.destroy.call(this);
    },
});

Application.SubmitAttrs = Backbone.View.extend({
    tagName: 'button',
    className: 'btn btn-primary',
    id: 'AttrsSubmitButton',
    initialize: function(viewConfig) {
        Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
        this.$el.text('VISUALIZE');
    },
    render: function() {
        return this;
    },
    destroy: function() {

        this.$el.unbind();
        this.remove();
    }
});

Application.TemplatesView = Backbone.View.extend({
    tagName: 'div',
    className: 'matcherBoxInner',
    initialize: function() {
        var that = this;
        this.$el.append('<div class="heading">Choose a template<p>We will put some explanation here</p><div/>')
        var $templist = $('<ul class="templateImgList"></ul>');

        $.each(Application.templates.list, function(index, item) {
            $templist.append('<li><button class="imgBtn"><img src="Assets/images/templates/'+item+'.png"><p class="templateTitle">'+item+'</p></button></li>');
        });
        this.$el.append($templist);

        $('button.imgBtn', this.$el).on('click', this.btnSelected);
    },
    btnSelected: function(){
        var vizLayer = $('.templateTitle', this).text();
        Application.userConfig.vizLayer = vizLayer;
        Application._vent.trigger('controlpanel/subview/vizLayer', vizLayer);
    },
    render: function() {
        return this;
    },
    destroy: function() {
        this.$el.unbind();
        this.remove();
    }
});


Application.AttributesView = Backbone.View.extend({
    tagName: 'div',
    className: 'matcherBoxInner',
    initialize: function() {
        var that = this;
        this.$el.append('<div class="heading">Match attributes<p>We will put some explanation here</p><div/>')
        var $templist = $('<div class="SetColumns"></div>');
        this.$el.append($templist);
    },
    render: function() {
        // this.$el.append(this.menu.render().$el);
        return this;
    },
    destroy: function() {

        this.$el.unbind();
        this.remove();
    }
});
