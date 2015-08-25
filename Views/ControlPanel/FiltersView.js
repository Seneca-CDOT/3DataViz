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

        Application._vent.on('controlpanel/categories', this.getFiltersFromDataset, this);

        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';

    },
    getDefaultFilters: function() {

        var that = this;

        var filterslist = Application.templates[Application.userConfig.template].filters; // default categories

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
        this.$el.empty();
        this.$el.append(view.$el);

        this.categoriesGroupsViews.push(view);

    },
    render: function() {


        return this;
    },
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
        this.addLabel(group.name);
        this.list(group);

        this.checkedColor = '#79839F';
        this.uncheckedColor = '';

    },
    render: function() {

        return this;
    },
    addLabel: function(name) {

        if (name) {
            var $label = $('<div><label class="label">BY ' + name.toUpperCase() + '</label></div>');
            this.$el.append($label);
        }
    },
    list: function(group) {

        var that = this;

        $.each(group.list, function(index, category) {

            var checkbox = that.createCheckBox(category, group.name);
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
    createCheckBox: function(category, groupname) {

        var $box = $('<div class="checkbox">'+category.name+'</div>');

        $box.attr('id', '_' + category.name);
        $box.data('category',category.name);

        if(category.color){
          var $label = $('<span></span>');
          $label.css({'background': category.color});
          $box.prepend($label);
        }

        $box.data('checked', 'false');
        $box.name = category.name;
        $box.data('group', groupname);
        this.checkboxes.push($box);
        $box.click(this.action.bind(this));

        return $box;

    },
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
