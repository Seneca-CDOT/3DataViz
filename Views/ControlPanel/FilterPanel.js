Application.FilterPanel = Backbone.View.extend({
    tagName: 'div',
    id: 'filterBox',
    initialize: function() {
        Application.attrsMap = {}; // a map of attributes
        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';
        this.appendHeader();
        //this.userAttributesView = new Application.UserAttributesSet(Application.attrsMap);
        //this.parserAttributesView = new Application.ParserAttributesSet(Application.attrsMap);
        //this.templatesView = new Application.TemplatesView();

        this.submit = new Application.SubmitAttrs();
        this.submit.$el.on('click', this.action.bind(this));
        Application._vent.on('matcher/on', this.showMatcher, this);
        Application._vent.on('matcher/off', this.hideMatcher, this);
        Application._vent.on('matcher/user/add', this.setUserAttribute, this);
        Application._vent.on('matcher/parser/add', this.setParserAttribute, this);
        Application._vent.on('matcher/user/remove', this.removeUserAttribute, this);
        Application._vent.on('matcher/parser/remove', this.removeParserAttribute, this);
        Application._vent.on('controlpanel/subview/vizLayer', this.resetAttributes, this);
        //this.hideMatcher();
    },
    render: function() {
        // this.$el.append(this.userAttributesView.render().$el);
        // this.$el.append(this.parserAttributesView.render().$el);
        // this.$el.append(this.templatesView.render().$el);
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

Application.FilterCallButton = Backbone.View.extend({
    tagName: 'button',
    className: 'btn btn-primary button',
    id: 'FiltersButton',
    events: {
        'mousedown':'action'
    },
    initialize: function() {
        this.$el.text('FILTERS');
    },
    render: function() {
        return this;
    },
    action: function() {

        Application._vent.trigger('matcher/submit');
        Application._vent.trigger('matcher/off');

    },
    destroy: function() {

        this.$el.unbind();
        this.remove();
    }
});