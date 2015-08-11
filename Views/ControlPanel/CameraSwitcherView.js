Application.CameraSwitcherView = Backbone.View.extend({
    tagName: 'div',
    className: 'configList',
    initialize: function() {

        this.cameraButton = new Application.Button();
        this.cameraButton.$el.text('CAMERA ANGLE');
        this.cameraButton.$el.on('mousedown', this.cameraButtonAction.bind(this));

        this.cameraSwitcherPanel = new Application.CameraSwitcherPanel();
        Application._vent.on('controlpanel/cameraswitcher', this.showCameraSwitcher, this);

    },
    render: function() {
        this.$el.append(this.cameraButton.$el);
        this.$el.append(this.cameraSwitcherPanel.$el);
        this.cameraSwitcherPanel.$el.hide();

        return this;
    },
    showCameraSwitcher: function(){
      this.$el.show();
    },
    toggleCameraSwitcherPanel: function() {

        this.cameraSwitcherPanel.$el.toggle();
    },
    cameraButtonAction: function() {

        this.toggleCameraSwitcherPanel();
    },
    destroy: function() {

        Application._vent.unbind('controlpanel/cameraswitcher', this.showCameraSwitcher);
        this.cameraButton.destroy();
        this.cameraButton = null;
        this.cameraSwitcherPanel.destroy();
        this.cameraSwitcherPanel = null;
    }
});


Application.CameraSwitcherPanel = Backbone.View.extend({
    tagName: 'div',
    id: 'cameraSwitcherPanel',
    initialize: function() {

        this.categoriesGroupsViews = []; // hold an array of views

        Application._vent.on('controlpanel/cameraswitcher', this.getAnglesFromDataset, this);

        this.lastUserPropName = ''; // the name of the last property created
        this.lastParserPropName = '';

    },
    getAnglesFromDataset: function(list) {

      console.log("getAnglesFromDataset !!");

        var obj = {};
        var x = Application.attrsMap['x'];
        var y = Application.attrsMap['y'];
        var z = Application.attrsMap['z'];

        obj.name = 'Attributes';
        obj.list = [
          {
            name: y + '-' + x,
            cameraPos: {x:0, y:0, z:100}
          },
          {
            name: z + '-' + x,
            cameraPos: {x:0, y:-100, z:0}
          },
          {
            name: y + '-' + z,
            cameraPos: {x:-100, y:0, z:0}
          }
        ];
        this.cameraAngleView = new Application.CameraAngleSet(obj);
        this.$el.append(this.cameraAngleView.$el);

    },
    render: function() {
        return this;
    },
    destroy: function() {
      Application._vent.unbind('controlpanel/cameraswitcher', this.getAnglesFromDataset);
      this.cameraAngleView.destroy();
    }
});

Application.CameraAngleSet = Backbone.View.extend({
    tagName: 'div',
    className: 'configList',
    initialize: function(obj) {
        this.checkboxes = []; // array of checkboxes
        this.labels = [];
        this.addLabel(obj.name);
        this.list(obj);
    },
    render: function() {

        return this;
    },
    addLabel: function(name) {
        if (name) {
            this.label = $('<div><label class="label">BY ' + name.toUpperCase() + '</label></div>');
            this.$el.append(this.label);
        }
    },
    list: function(obj) {

        var that = this;
        $.each(obj.list, function(index, list) {
            var checkbox = that.createCheckBox(list, list.name);
            that.$el.append(checkbox);
        });

    },
    action: function(e) {
      var obj = {};
      obj.cameraPos = new THREE.Vector3($(e.target).data('px'), $(e.target).data('py'), $(e.target).data('pz'));
      Application._vent.trigger('controlpanel/cameraSnap', obj);
    },
    createCheckBox: function(obj, groupname) {

        var $box = $('<div class="checkbox"> ' + obj.name + ' </div>');

        $box.attr('id', '_' + obj.name);
        $box.data('checked', 'false');
        $box.data('px', obj.cameraPos.x);
        $box.data('py', obj.cameraPos.y);
        $box.data('pz', obj.cameraPos.z);

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
        this.label.remove();
        this.removeCheckboxes();
        this.checkedColor = null;
        this.uncheckedColor = null;
    }
});
