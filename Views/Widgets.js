Application.Matcher = Backbone.View.extend({
    tagName: 'div',
    id: 'matcherBox',
    initialize: function() {
        this.attrsMap = {}; // a map of attributes
        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';
        this.left = new Application.UserAttributesSet(this.attrsMap);
        this.right = new Application.ParserAttributesSet(this.attrsMap);
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
        this.$el.append(this.left.$el);
        this.$el.append(this.right.$el);
        this.$el.append(this.submit.$el);
        return this;
    },
    showMatcher: function() {

        this.$el.show();
    },
    hideMatcher: function() {

        this.$el.hide();
    },
    setUserAttribute: function(attr) {

        this.lastUserPropName = attr;
        //this.attrsMap[this.lastPropName] = attr;
        // console.log('SetUser', this.attrsMap);

    },
    removeUserAttribute: function(attr) {

        this.attrsMap[this.lastParserPropName] = '';
        // console.log('RemoveUser', this.attrsMap);

    },
    setParserAttribute: function(attr) {

        this.attrsMap[attr] = this.lastUserPropName;
        this.lastParserPropertyName = attr;
        // console.log('SetParser', this.attrsMap);

    },
    removeParserAttribute: function(attr) {

        delete this.attrsMap[attr];
        //this.lastPropName = attr;
        // console.log('RemoveParser', this.attrsMap);
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

        for(var i = 0; i < this.checkboxes.length; i++) {

            if (name == this.checkboxes[i].name) return this.checkboxes[i];
        }
    },
    destroy: function() {

        Application._vent.unbind('matcher');
        this.remove();
        $.each(this.checkboxes, function(checkbox) {

            checkbox.unbind();
            checkbox = null;

        });
        this.checkboxes = null;
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

        $(box).css('background-color',this.chosenColor);
        $(box).unbind();
    },
    unsetAttributeChosen: function(ParserAttr) {

        var attr = this.findPairByKey(ParserAttr);
        var box = this.getCheckbox(attr);

        $(box).css('background-color',this.checkedColor);
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
    }
});

Application.ParserAttributesSet = Application.AttributesSet.extend({
    id: 'ParserSetColumn',
    initialize: function(attrsMap) {
        this.eventName = 'matcher/parser';
        Application.AttributesSet.prototype.initialize.call(this, attrsMap);
        Application._vent.on(this.eventName, this.listAttributes, this);
        Application._vent.on('matcher/user/click', this.makeActiveTheRest, this);
        Application._vent.on('matcher/parser/click', this.setAttributeChosen, this);
        Application._vent.on('matcher/parser/unclick', this.unsetAttributeChosen, this);
    },
    render: function() {

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
    listAttributes: function(obj) {

        var list = $.map(obj, function(value, index) {
            return [index];
        });

        Application.AttributesSet.prototype.listAttributes.call(this, list);
        this.makeInactiveTheRest();
    }
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
