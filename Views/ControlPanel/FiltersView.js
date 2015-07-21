Application.FiltersView = Backbone.View.extend({
    tagName: 'div',
    className: 'configList',
    initialize: function() {

        this.filterButton = new Application.Button();
        this.filterButton.$el.text('FILTERS');
        this.filterButton.$el.on('mousedown', this.filterButtonAction.bind(this));

        this.filterPanel = new Application.FilterPanel();

    },
    render: function() {
        this.$el.append(this.filterButton.$el);
        this.$el.append(this.filterPanel.$el);
        this.filterPanel.$el.hide();

        return this;
    },
    toggleFilterPanel: function() {

        this.filterPanel.$el.toggle();
    },
    removeFilterPanel: function() {

        if (this.filterPanel) {
            this.filterPanel.destroy();
            this.filterPanel = null;
        }
    },
    filterButtonAction: function() {

        this.toggleFilterPanel();
    },
    destroy: function() {

        this.remove();
        this.filterButton.destroy();
        this.filterPanel.destroy();
        // this.categoriesList = null;
    }
});


Application.FilterPanel = Backbone.View.extend({
    tagName: 'div',
    id: 'filterPanel',
    initialize: function() {

        this.categoriesGroupsViews = []; // hold an array of views
        //this.getDefaultFilters();

        Application._vent.on('controlpanel/categories', this.getFiltersFromDataset, this);

        // Application._vent.on('controlpanel/categories', this.addCategoriesView, this);

        // Application.attrsMap = {}; // a map of attributes
        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';
        // this.appendHeader();
        //this.userAttributesView = new Application.UserAttributesSet(Application.attrsMap);
        //this.parserAttributesView = new Application.ParserAttributesSet(Application.attrsMap);
        //this.templatesView = new Application.TemplatesView();

        // this.submit = new Application.SubmitAttrs();
        // this.submit.$el.on('click', this.action.bind(this));
        // Application._vent.on('matcher/on', this.showMatcher, this);
        // Application._vent.on('matcher/off', this.hideMatcher, this);
        // Application._vent.on('matcher/user/add', this.setUserAttribute, this);
        // Application._vent.on('matcher/parser/add', this.setParserAttribute, this);
        // Application._vent.on('matcher/user/remove', this.removeUserAttribute, this);
        // Application._vent.on('matcher/parser/remove', this.removeParserAttribute, this);
        // Application._vent.on('controlpanel/subview/vizLayer', this.resetAttributes, this);
        //this.hideMatcher();
    },
    getDefaultFilters: function() {

        var that = this;

        var filterslist = Application.templates[Application.userConfig.vizLayer].filters; // default categories

        $.each(filterslist, function(i, filtername) {

            var obj = {};
            obj.name = filtername;
            obj.list = [];
            that.addCategoriesGroup(obj);


        });
    },
    getFiltersFromDataset: function(list) {

        var name = Application.attrsMap['category'];
        var obj = {};
        obj.name = name;
        obj.list = list;

        this.addCategoriesGroup(obj);
    },
    addCategoriesGroup: function(obj) {

        var view = new Application.FiltersSet(obj);
        this.$el.append(view.$el);

        this.categoriesGroupsViews.push(view);

    },
    render: function() {
        // this.$el.append(this.userAttributesView.render().$el);
        // this.$el.append(this.parserAttributesView.render().$el);
        // this.$el.append(this.templatesView.render().$el);
        // this.$el.append(this.labelForTemplates);
        // this.$el.append(this.submit.render().$el);

        return this;
    },
    // appendHeader: function() {

    //     var $header = $('<div id="AttrsHeader"></div>');
    //     $header.append("<div class='heading'>User attributes</div>");
    //     $header.append("<div class='heading'>Parser attributes</div>");
    //     $header.append("<div class='heading'>Choose a template</div>");
    //     this.$el.append($header);

    // },
    // resetAttributes: function() {

    //     for (var member in Application.attrsMap) delete Application.attrsMap[member];
    // },
    // showMatcher: function() {

    //     this.$el.show();
    // },
    // hideMatcher: function() {

    //     this.$el.hide();
    // },
    // setUserAttribute: function(attr) {

    //     this.lastUserPropName = attr;

    // },
    // removeUserAttribute: function(attr) {

    //     Application.attrsMap[this.lastParserPropName] = '';

    // },
    // setParserAttribute: function(attr) {

    //     Application.attrsMap[attr] = this.lastUserPropName;
    //     this.lastParserPropertyName = attr;

    // },
    // removeParserAttribute: function(attr) {

    //     delete Application.attrsMap[attr];
    // },
    // action: function() {

    //     Application._vent.trigger('matcher/submit');
    //     Application._vent.trigger('matcher/off');

    // },
    destroy: function() {

        var that = this;

        Application._vent.unbind('controlpanel/categories', this.getFiltersFromDataset);

        $.each( this.categoriesGroupsViews, function(i, view) {

            view.destroy();

        });


    }
});


Application.FiltersSet = Backbone.View.extend({
    tagName: 'div',
    className: 'configList',
    initialize: function(group) {
        this.checkboxes = []; // array of checkboxes
        // this.group = group;
        this.addLabel(group.name);
        this.list(group);
        // Application.attrsMap = attrsMap;
        //this.inactiveColor = '#79839F';
        //this.activeColor = '#FFFFFF';
        this.checkedColor = '#79839F';
        this.uncheckedColor = '';
        //this.chosenColor = '#40405C';
        // this.list(Application.!!!!)
    },
    render: function() {

        return this;
    },
    addLabel: function(name) {

        var $label = $('<div><label class="label">BY ' + name.toUpperCase() + '</label></div>');
        this.$el.append($label);
    },
    list: function(group) {

        var that = this;

        $.each(group.list, function(index, categoryname) {

            var checkbox = that.createCheckBox(categoryname, group.name, group.list);

            that.$el.append(checkbox);

        });

    },
    action: function(e) {

        var checked = $(e.target).data('checked');
        var groupname = $(e.target).data('group');

        if (checked == 'false') {

            $(e.target).data('checked', 'true'); // makes button checked

            var group = {};

            group.name = groupname;
            group.category = $(e.target).data('category');

            Application._vent.trigger('filters/add', group);

            $(e.target).css('background-color', this.checkedColor); // changes color to grey when checked


        } else if (checked == 'true') {

            $(e.target).data('checked', 'false');

            var group = {};

            group.name = groupname;
            group.category = $(e.target).data('category');

            Application._vent.trigger('filters/remove', group);

            $(e.target).css('background-color', this.uncheckedColor);


        } else {

            console.log("Couldn't check if the target was checked", e);
        }

    },

    // makeActiveTheRest: function() {

    //     var that = this;

    //     $.each(this.checkboxes, function(index, box) {

    //         if (box.data('checked') == 'false') {

    //             box.css('color', that.activeColor);

    //             box.click(that.action.bind(that));
    //         }

    //     });

    // },
    // makeInactiveTheRest: function() {

    //     var that = this;

    //     $.each(this.checkboxes, function(index, box) {

    //         if (box.data('checked') == 'false') {

    //             box.css('color', that.inactiveColor);

    //             box.unbind();
    //         }


    //     });

    // },
    createCheckBox: function(category, groupname, list) {

        var $box = $('<div class="checkbox"><span></span>'+category+'</div>');
        var color = Application.colors[list.indexOf(category)];
        $box.attr('id', '_' + category);
        $box.data('category',category);

        $('span',$box).css({'background':color});

        $box.data('checked', 'false');

        $box.name = category;

        $box.data('group', groupname);

        this.checkboxes.push($box);

        $box.click(this.action.bind(this));

        return $box;

    },
    // findPairByKey: function(attr) {

    //     return Application.attrsMap[attr];

    // },
    // findPairByValue: function(attr) {

    //     return _.invert(Application.attrsMap)[attr];

    // },
    // getCheckbox: function(name) {

    //     for (var i = 0; i < this.checkboxes.length; i++) {

    //         if (name == this.checkboxes[i].name) return this.checkboxes[i];
    //     }
    // },
    removeCheckboxes: function() {

        $.each(this.checkboxes, function(index, checkbox) {

            checkbox.unbind();
            checkbox.remove();

        });

        this.checkboxes = null;

    },
    destroy: function() {

        this.removeCheckboxes();
        this.checkedColor = null;
        this.uncheckedColor = null;
    }


});
