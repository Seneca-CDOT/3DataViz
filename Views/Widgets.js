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


Application.UserAttributesSet = Backbone.View.extend({
    tagName: 'div',
    id: 'UserSetColumn',
    initialize: function() {
        Application._vent.on('matcher/user', this.listAttributes, this);
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

            $(e.target).data('checked', 'true');

            Application._vent.trigger('matcher/user/add', e.target.innerText);

            $(e.target).css('background-color', '#79839F');

            $.each(this.checkboxes, function() {

                if ($(this).data('checked') == 'false') {

                    //$(this).attr('disabled','true');
                    $(this).css('color', '#79839F');
                }

            });

        } else if (checked == 'true') {

            $(e.target).data('checked', 'false');

            Application._vent.trigger('matcher/user/remove', e.target.innerText);

            $(e.target).css('background-color', '');

            $.each(this.checkboxes, function() {

                $(this).css('color', 'white');
            });

        } else {

            console.log("Couldn't check if the target was checked", e);
        }


    },
    createCheckBox: function(name) {

        var $box = $('<div class="checkbox"></div>');

        $box.attr('id', '_' + name);

        $box.html(name);

        $box.data('checked', 'false');

        this.checkboxes.push($box);

        $box.click(this.action.bind(this));

        return $box;

    },
    destroy: function() {

        Application._vent.unbind('matcher/user');
        this.remove();
        $.each(this.checkboxes, function(checkbox) {

            checkbox.unbind();
            checkbox = null;

        });
        this.checkboxes = null;
    }
});

Application.ParserAttributesSet = Backbone.View.extend({
    tagName: 'div',
    id: 'ParserSetColumn',
    initialize: function() {
        Application._vent.on('matcher/parser', this.listAttributes, this);
        this.checkboxes = []; // array of checkboxes
    },
    render: function() {

        return this;
    },
    listAttributes: function(obj) {

        var that = this;

        var list = $.map(obj, function(value, index) {
            return [index];
        });
        $.each(list, function(index, name) {

            var checkbox = that.createCheckBox(name);

            that.$el.append(checkbox);

        });

    },
    action: function(e) {

        var checked = $(e.target).data('checked');

        if (checked == 'false') {

            $(e.target).data('checked', 'true');

            Application._vent.trigger('matcher/parser/add', e.target.innerText);

            $(e.target).css('background-color', '#79839F');

            $.each(this.checkboxes, function() {

                if ($(this).data('checked') == 'false') {

                    //$(this).attr('disabled','true');
                    $(this).css('color', '#79839F');
                }

            });

        } else if (checked == 'true') {

            $(e.target).data('checked', 'false');

            Application._vent.trigger('matcher/parser/remove', e.target.innerText);

            $(e.target).css('background-color', '');

            $.each(this.checkboxes, function() {

                $(this).css('color', 'white');
            });

        } else {

            console.log("Couldn't check if the target was checked", e);
        }


    },
    createCheckBox: function(name) {

        var $box = $('<div class="checkbox"></div>');

        $box.attr('id', '_' + name);

        $box.html(name);

        $box.data('checked', 'false');

        this.checkboxes.push($box);

        $box.click(this.action.bind(this));

        return $box;

    },
    destroy: function() {

        Application._vent.unbind('matcher/parser');
        this.remove();
         $.each(this.checkboxes, function(checkbox) {

            checkbox.unbind();
            checkbox = null;

        });
        this.checkboxes = null;
    }
});
