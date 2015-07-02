Application.Matcher = Backbone.View.extend({
    tagName: 'div',
    id: 'matcherBox',
    initialize: function() {
        this.attrsMap = {}; // a map of attributes
        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';
        this.appendHeader();
        this.userAttributesView = new Application.UserAttributesSet(this.attrsMap);
        this.parserAttributeView = new Application.ParserAttributesSet(this.attrsMap);
        this.templatesView = new Application.TemplatesView();

        this.submit = new Application.SubmitAttrs();
        this.submit.$el.on('click', this.postAttrsMap.bind(this));
        Application._vent.on('matcher/on', this.showMatcher, this);
        Application._vent.on('matcher/off', this.hideMatcher, this);
        Application._vent.on('matcher/user/add', this.setUserAttribute, this);
        Application._vent.on('matcher/parser/add', this.setParserAttribute, this);
        Application._vent.on('matcher/user/remove', this.removeUserAttribute, this);
        Application._vent.on('matcher/parser/remove', this.removeParserAttribute, this);
    },
    render: function() {
        this.$el.append(this.userAttributesView.render().$el);
        this.$el.append(this.parserAttributeView.render().$el);
        this.$el.append(this.templatesView.render().$el);
        this.$el.append(this.labelForTemplates);
        this.$el.append(this.submit.render().$el);

        return this;
    },
    appendHeader: function() {

        var $header = $('<div id="AttrsHeader"></div>');
        $header.append("<div class='heading'>User attributes</div>");
        $header.append("<div class='heading'>Parser attributes</div>");
        $header.append("<div class='heading'>Choose a template</div>");
        this.$el.append($header);

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

        this.attrsMap[this.lastParserPropName] = '';

    },
    setParserAttribute: function(attr) {

        this.attrsMap[attr] = this.lastUserPropName;
        this.lastParserPropertyName = attr;

    },
    removeParserAttribute: function(attr) {

        delete this.attrsMap[attr];
    },
    postAttrsMap: function() {

        console.log(this.attrsMap);

    },
    destroy: function() {

        this.left.destroy();
        this.right.destroy();
        this.left = null;
        this.right = null;
        Application._vent.unbind('matcher/on');
        Application._vent.unbind('matcher/off');
    }
});


Application.AttributesSet = Backbone.View.extend({
    tagName: 'div',
    initialize: function(attrsMap) {
        // Application._vent.on('matcher', this.listAttributes, this);
        this.checkboxes = []; // array of checkboxes
        this.attrsMap = attrsMap;
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

        if (this.checkboxes != null) { this.destroy(); }

        $.each(list, function(index, name) {

            var checkbox = that.createCheckBox(name);

            that.$el.append(checkbox);

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

            if ($(box).data('checked') == 'false') {

                $(box).css('color', that.activeColor);

                $(box).click(that.action.bind(that));
            }

        });

    },
    makeInactiveTheRest: function() {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            if ($(box).data('checked') == 'false') {

                $(box).css('color', that.inactiveColor);

                $(box).unbind();
            }


        });

    },
    createCheckBox: function(name) {

        var box = $('<div class="checkbox"></div>');

        box.attr('id', '_' + name);

        box.html(name);

        box.data('checked', 'false');

        box.name = name;

        this.checkboxes.push(box);

        $(box).click(this.action.bind(this));

        return box;

    },
    findPairByKey: function(attr) {

        return this.attrsMap[attr];

    },
    findPairByValue: function(attr) {

        return _.invert(this.attrsMap)[attr];

    },
    getCheckbox: function(name) {

        for (var i = 0; i < this.checkboxes.length; i++) {

            if (name == this.checkboxes[i].name) return this.checkboxes[i];
        }
    },
    destroy: function() {

        // Application._vent.unbind('matcher');
        // this.remove();
        $.each(this.checkboxes, function(index, checkbox) {

            checkbox.unbind();
            checkbox.remove();
            checkbox = null;

        });
        this.checkboxes = [];
    }


});


Application.UserAttributesSet = Application.AttributesSet.extend({
    id: 'UserSetColumn',
    initialize: function(attrsMap) {
        this.eventName = 'matcher/user';
        Application.AttributesSet.prototype.initialize.call(this, attrsMap);
        Application._vent.on(this.eventName, this.listAttributes, this);
        Application._vent.on('matcher/parser/click', this.makeActiveTheRest, this);
        Application._vent.on('matcher/parser/click', this.setAttributeChosen, this);
        Application._vent.on('matcher/parser/unclick', this.unsetAttributeChosen, this);
        this.lastChoice; // last choice of userSet
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
    listAttributes: function(list) {
        Application.AttributesSet.prototype.listAttributes.call(this, list);
    },
    destroy: function() {

         Application.AttributesSet.prototype.destroy.call(this);
    },
});

Application.ParserAttributesSet = Application.AttributesSet.extend({
    id: 'ParserSetColumn',
    initialize: function(attrsMap) {
        this.eventName = 'matcher/parser';
        Application.AttributesSet.prototype.initialize.call(this, attrsMap);
        Application._vent.on('controlpanel/subview/vizLayer', this.listAttributes, this);
        Application._vent.on('matcher/user/click', this.makeActiveTheRest, this);
        Application._vent.on('matcher/parser/click', this.setAttributeChosen, this);
        Application._vent.on('matcher/parser/unclick', this.unsetAttributeChosen, this);

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

    },
    listAttributes: function(template) {

        var list = Application.templates[template].default;

        Application.AttributesSet.prototype.listAttributes.call(this, list);
        this.makeInactiveTheRest();
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
        this.$el.text('SUBMIT');
    },
    render: function() {
        return this;
    }
});

Application.TemplatesView = Backbone.View.extend({
    tagName: 'div',
    id: 'TemplateView',
    initialize: function() {
        this.menu = new Application.DropDownList(Application.templates);
    },
    render: function() {
        this.$el.append(this.menu.render().$el);
        return this;
    }
});
