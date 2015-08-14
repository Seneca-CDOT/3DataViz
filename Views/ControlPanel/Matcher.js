Application.Matcher = Backbone.View.extend({
    tagName: 'div',
    id: 'matcherBox',
    initialize: function() {
        Application.attrsMap = {}; // a map of attributes
        Application.attrsMapIndex = 0;
        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';

        this.appendTitleBox();
        this.templatesView = new Application.TemplatesView();
        this.attributesView =  new Application.AttributesView();

        this.userAttributesView = new Application.UserAttributesSet(Application.attrsMap);
        this.parserAttributesView = new Application.ParserAttributesSet(Application.attrsMap);

        this.submit = new Application.SubmitAttrs();
        Application._vent.on('matcher/on', this.showMatcher, this);
        Application._vent.on('matcher/off', this.hideMatcher, this);
        Application._vent.on('matcher/user/add', this.setUserAttribute, this);
        Application._vent.on('matcher/parser/add', this.setParserAttribute, this);
        Application._vent.on('matcher/user/remove', this.removeUserAttribute, this);
        Application._vent.on('matcher/parser/remove', this.removeParserAttribute, this);
        Application._vent.on('controlpanel/subview/template', this.resetAttributes, this);
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
        $box.append('<div class="heading">Title<p>Please input a title of your visualization.</p><div/>')
        $box.append('<input class="form-control vizTitle">');
        this.$el.append($box);
    },
    resetAttributes: function() {

        for (var member in Application.attrsMap) delete Application.attrsMap[member];
    },
    showMatcher: function() {
        this.templatesView.chooseDefault();
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
    destroy: function() {

        this.attributesView.destroy();
        this.userAttributesView.destroy();
        this.parserAttributesView.destroy();
        this.templatesView.destroy();
        this.attributesView = null;
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
        this.inactiveClass = 'inactive';
        this.activeClass = 'active';
        this.chosenClass = 'chosen';
        this.selectedClass = 'selected';
        this.attrsChosen = [];
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

            var checkbox = that.createCheckBox(name);

            that.$el.append(checkbox);

        });

    },
    action: function(e) {

        if($(e.target).hasClass(this.inactiveClass)){
            return;
        }

        var checked = $(e.target).data('checked');

        if (checked == 'false') {

            $(e.target).data('checked', 'true'); // makes button checked

            Application._vent.trigger(this.eventName + '/add', e.target.innerHTML);
            $(e.target).addClass(this.chosenClass);

            Application._vent.trigger(this.eventName + '/click', e.target.innerHTML);

            this.makeInactiveTheRest(e.target);

        } else if (checked == 'true') {

            $(e.target).data('checked', 'false');

            Application._vent.trigger(this.eventName + '/unclick', e.target.innerHTML);

            $(e.target).removeClass(this.selectedClass);
            $(e.target).removeClass(this.chosenClass);

            Application._vent.trigger(this.eventName + '/remove', e.target.innerHTML);

            this.makeActiveTheRest(e.target);

        } else {

            console.log("Couldn't check if the target was checked", e);
        }

    },
    makeActiveTheRest: function(e) {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            if(box.attr('id') != $(e).attr('id') || typeof e === 'undefined'){ // check id instead of checked.
            // if (box.data('checked') == 'false') {
                box.removeClass(that.inactiveClass);
            }

        });

    },
    makeInactiveTheRest: function(e) {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            //if (box.data('checked') == 'false') {
            if($(box).attr('id') != $(e).attr('id') && !$(box).hasClass(that.selectedClass)){

                box.removeClass(that.activeClass);
                box.addClass(that.inactiveClass);
                // box.css('color', that.inactiveColor);
                // box.unbind();
                box.removeClass(that.chosenClass);
                $(box).data('checked', 'false');
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
        if (this.$newAttr) {
        this.$newAttr.remove();
        this.$newAttr.unbind();
        this.valueIndex = 1;
        this.dateIndex = 1;
    }

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
    },
    getAvailableColor: function(){
        var found = false;
        var className = true;
        for(var i=1; i<20; i++){
            $.each(this.checkboxes, function(index, box) {
                className = 'sel-' + i;
                if(box.hasClass(className)){
                    found = true;
                    return true;
                }
            });
            if(!found){
                return className;
            }else{
                found = false;
            }
        }
        return className;
    }
});

Application.UserAttributesSet = Application.AttributesSet.extend({
    className: 'SetColumn',
    initialize: function(attrsMap) {
        this.eventName = 'matcher/user';
        Application.AttributesSet.prototype.initialize.call(this, attrsMap);
        Application._vent.on(this.eventName, this.listAttributes, this);
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

        if($(e.target).hasClass(this.inactiveClass)){
            return;
        }

        Application.AttributesSet.prototype.action.call(this, e);

        var checked = $(e.target).data('checked');

        if (checked == 'true') {

            this.lastChoice = $(e.target);
        }

    },
    setAttributeChosen: function(ParserAttr) {

        var attr = this.findPairByKey(ParserAttr);
        var box = this.getCheckbox(attr);
        $(box).addClass(this.selectedClass);
        $(box).addClass(this.getAvailableColor());
        $(box).removeClass(this.activeClass);
        $(box).removeClass(this.chosenClass);

        $(box).unbind();
    },
    unsetAttributeChosen: function(ParserAttr) {

        var attr = this.findPairByKey(ParserAttr);
        var box = this.getCheckbox(attr);

        $(box).removeClass(this.selectedClass);
        $(box).addClass(this.chosenClass);
        $(box).removeClass (function (index, css) { return (css.match (/(^|\s)sel-\S+/g) || []).join(' ');});

        $(box).click(this.action.bind(this));
        this.makeInactiveTheRest(box);
        Application._vent.trigger('matcher/user/add', attr);
    },
    render: function() {

        Application.AttributesSet.prototype.render.call(this);

        return this;
    },
    suscribe: function() {

        Application._vent.on('controlpanel/subview/template', this.resetAttributes, this);
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
        Application._vent.unbind('controlpanel/subview/template', this.listAttributes);
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
        Application._vent.on('matcher/on', this.suscribe, this);
        Application._vent.on('matcher/off', this.unsuscribe, this);
        Application._vent.on('matcher/user/click', this.makeActiveTheRest, this);
        Application._vent.on('matcher/parser/click', this.setAttributeChosen, this);
        Application._vent.on('matcher/parser/unclick', this.unsetAttributeChosen, this);

        this.templateChosen = false;
        this.dateIndex = 1;
        this.valueIndex = 1;

    },
    render: function() {
        Application.AttributesSet.prototype.render.call(this);

        return this;
    },
    setAttributeChosen: function(attr) {

        var box = this.getCheckbox(attr);

        $(box).addClass(this.selectedClass);
        $(box).addClass(this.getAvailableColor());

    },
    unsetAttributeChosen: function(attr) {

        var box = this.getCheckbox(attr);

        $(box).removeClass(this.selectedClass);
        $(box).removeClass(this.chosenClass);
        $(box).removeClass (function (index, css) { return (css.match (/(^|\s)sel-\S+/g) || []).join(' ');});

        $(box).data('checked', 'false');

    },
    suscribe: function() {

        Application._vent.on('controlpanel/subview/template', this.listAttributes, this);
        this.resetAttributes();
    },
    resetAttributes: function() {

        var that = this;

        $.each(this.checkboxes, function(index, box) {

            that.unsetAttributeChosen(box.name);
        });

    },
    listAttributes: function(template) {

        this.list = Application.templates[template].attributes.default;

        Application.AttributesSet.prototype.listAttributes.call(this, this.list);
        this.makeInactiveTheRest();
        this.templateIsChosen = true;
        this.addPlusButton();
    },
    addPlusButton: function() {
        this.$newAttr = $('<button class="checkbox" style="text-align: center">+</button>');
        this.$newAttr.on('click', this.addAction.bind(this));
        this.$el.append(this.$newAttr);
    },
    addAction: function() {
        // this.$newAttr.remove();
        // this.$newAttr.unbind();
        this.$attrMenu = $('<select id="newAttr">' +
        '<option value="" selected disabled></option>' +
        '<option value="date">new Date</option>' +
        '<option value="value">new Value</option></select>');
        this.$attrMenu.on('change', this.menuAction.bind(this));
        this.$attrMenu.insertBefore($('.checkbox').last());
    },
    menuAction: function(e) {

        this.addAttribute(e.target.value);

    },
    addAttribute: function(name) {

        var value = '';

        switch (name) {
            case 'value':
            value = ++this.valueIndex;
            break;
            case 'date':
            value = ++this.dateIndex;
            break;
        }

        this.$attrMenu.unbind();
        var checkbox = this.createCheckBox(name + value);
        this.$attrMenu.replaceWith(checkbox);
        this.makeInactiveTheRest();
    },
    unsuscribe: function() {
        Application._vent.unbind('controlpanel/subview/template', this.listAttributes);
    },
    destroy: function() {
        Application.AttributesSet.prototype.destroy.call(this);
        this.$attrMenu.unbind();
    },
});

Application.SubmitAttrs = Backbone.View.extend({
    tagName: 'button',
    className: 'btn btn-primary',
    id: 'AttrsSubmitButton',
    events: {
        'mousedown':'action'
    },
    initialize: function(viewConfig) {
      //  Application.ControlElementsGlobeView.prototype.initialize.call(this, viewConfig);
        this.$el.text('VISUALIZE');
    },
    render: function() {
        return this;
    },
    action: function() {
        var key = $('.vizTitle').val() || $('.vizTitle').attr('placeholder');
        Application.userConfig.templateTitle = key;
        Application._vent.trigger('matcher/submit');
        Application._vent.trigger('matcher/off');

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
        this.$el.append('<div class="heading">Choose a template<p>Please select a visualization template for your data.</p><div/>')
        var $templist = $('<ul class="templateImgList"></ul>');


        $.each(Application.templates.map, function(index, item) {
            $templist.append('<li><button class="imgBtn"><img src="Assets/images/templates/'+ index + '.png"><p class="templateTitle" id="' + index + '">'+item+'</p></button></li>');
        });
        this.$el.append($templist);

        $('button.imgBtn', this.$el).on('click', this.btnSelected);
    },
    btnSelected: function(){

        var template = $('.templateTitle', this).attr('id');
        Application.userConfig.template = template;
        $(this).parent().siblings().removeClass('active');
        $(this).parent().addClass('active');

        if( $('.vizTitle').val() === ''){
            var str = Application.Helper.capitalize(Application.templates.map[template]) + " Visualization";
            $('.vizTitle').attr('placeholder', str);
        }

        Application._vent.trigger('controlpanel/subview/template', template);
    },
    render: function() {
        return this;
    },
    destroy: function() {
        this.$el.unbind();
        this.remove();
    },
    chooseDefault: function(){
        $('li:first-child .imgBtn', this.$el).trigger('click');
    }
});


Application.AttributesView = Backbone.View.extend({
    tagName: 'div',
    className: 'matcherBoxInner',
    initialize: function() {
        var that = this;
        this.$el.append('<div class="heading">Match attributes<p>Please match your data\'s attributes to attributes that are available in this template</p><div/>')
        var $templist = $('<div class="SetColumns"><div class="colTitle">User\'s data attributes</div><div class="colTitle">Template\'s data attributes</div></div>');
        this.$el.append($templist);
    },
    render: function() {
        return this;
    },
    destroy: function() {
        this.$el.unbind();
        this.remove();
    }
});
