Application.Matcher = Backbone.View.extend({
    tagName: 'div',
    id: 'matcherBox',
    initialize: function() {
        this.attrsMap = {}; // a map of attributes
        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';
        this.left = new Application.UserAttributesSet();
        this.right = new Application.ParserAttributesSet();
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
        console.log('SetUser', this.attrsMap);

    },
    removeUserAttribute: function(attr) {

        this.attrsMap[this.lastParserPropName] = '';
        console.log('RemoveUser', this.attrsMap);

    },
    setParserAttribute: function(attr) {

        this.attrsMap[attr] = this.lastUserPropName;
        this.lastParserPropertyName = attr;
        console.log('SetParser', this.attrsMap);

    },
    removeParserAttribute: function(attr) {

        delete this.attrsMap[attr];
        //this.lastPropName = attr;
        console.log('RemoveParser', this.attrsMap);
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
    initialize: function() {
        // Application._vent.on('matcher', this.listAttributes, this);
        this.checkboxes = []; // array of checkboxes
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

            $(e.target).css('background-color', '#79839F'); // changes color to grey when checked

            Application._vent.trigger(this.eventName + '/click', e.target);


            this.makeInactiveTheRest();

        } else if (checked == 'true') {

            $(e.target).data('checked', 'false');

            Application._vent.trigger(this.eventName + '/remove', e.target.innerText);
            Application._vent.trigger(this.eventName + '/unclick', e.target);

            $(e.target).css('background-color', '');

            this.makeActiveTheRest();

        } else {

            console.log("Couldn't check if the target was checked", e);
        }

    },
    setAttributeChosen: function(target) {

        $(target).css('background-color', 'red');

    },
    unsetAttributeChosen: function(target) {

        $(target).css('background-color', '');

    },
    makeActiveTheRest: function() {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            if ($(box).data('checked') == 'false') {

                $(box).css('color', 'white');

                $(box).click(that.action.bind(that));
            }

        });

    },
    makeInactiveTheRest: function() {

        $.each(this.checkboxes, function(index, box) {

            if ($(box).data('checked') == 'false') {

                $(box).css('color', '#79839F');

                $(box).unbind();
            }


        });

    },
    createCheckBox: function(name) {

        var box = $('<div class="checkbox"></div>');

        box.attr('id', '_' + name);

        box.html(name);

        box.data('checked', 'false');

        this.checkboxes.push(box);

        $(box).click(this.action.bind(this));

        return box;

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
    initialize: function() {
        this.eventName = 'matcher/user';
        Application.AttributesSet.prototype.initialize.call(this);
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
    setAttributeChosen: function() {

        $(this.lastChoice).css('background-color','red');
    },
    unsetAttributeChosen: function() {

        $(this.lastChoice).css('background-color','');
        this.makeInactiveTheRest();
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
    initialize: function() {
        this.eventName = 'matcher/parser';
        Application.AttributesSet.prototype.initialize.call(this);
        Application._vent.on(this.eventName, this.listAttributes, this);
        Application._vent.on('matcher/user/click', this.makeActiveTheRest, this);
        Application._vent.on('matcher/parser/click', this.setAttributeChosen, this);
        Application._vent.on('matcher/parser/unclick', this.unsetAttributeChosen, this);
    },
    render: function() {

        return this;
    },
    listAttributes: function(obj) {

        var list = $.map(obj, function(value, index) {
            return [index];
        });

        Application.AttributesSet.prototype.listAttributes.call(this, list);
        this.makeInactiveTheRest();
    }
});
