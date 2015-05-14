var Application = Application || {};

Application.DataStructures = {};

Application.DataStructures._NodeList = (function() {

  // TODO: make a memory efficient private store
  function _NodeList() {
  
    this._next = null;
    this._previous = null;

    this._data = null;
  };

  _NodeList.prototype.getNext = function() {

    return this._next;
  };

  _NodeList.prototype.setNext = function(next) {

    this._next = next;
  };

  _NodeList.prototype.getPrevious = function() {

    return this._previous;
  };

  _NodeList.prototype.setPrevious = function(previous) {

    this._previous = previous;
  };

  _NodeList.prototype.getData = function() {

    return this._data;
  };

  _NodeList.prototype.setData = function(data) {

    this._data = data;
  };

  return _NodeList;
})();


Application.DataStructures.List = (function() {
    
  // TODO: make a memory efficient private store
  function List() {

    this._pre_head = new Application.DataStructures._NodeList();
    this._post_tail = new Application.DataStructures._NodeList();

    this._pre_head._next = this._post_tail;
    this._post_tail._previous = this._pre_head;

    this._length = 0;
  };

  List.prototype.getLength = function() {

    return _length;
  };

  List.prototype.getBegin = function() {

    return this._pre_head._next;
  };

  List.prototype.getEnd = function() {

    return this._post_tail;
  };

  List.prototype.getLength = function() {

    return this._length;
  };

  List.prototype.isEmpty = function() {

    return (this.getLength() < 1);
  };

  List.prototype.pushBack = function(data) {

     privateMethods.insertNode.call(this, this.getEnd().getPrevious(), data);
  };

  List.prototype.popBack = function() {

    if (this._length > 0) {

      return privateMethods.removeNode.call(this, this.getEnd().getPrevious());
    }
    else {

      throw 'List is empty.';
    }
  };

  List.prototype.pushFront = function(data) {

     privateMethods.insertNode.call(this, this.getBegin().getPrevious(), data);
  };

  List.prototype.popFront = function() {

    if (this._length > 0) {

      return privateMethods.removeNode.call(this, this.getBegin());
    }
    else {

      throw 'List is empty.';
    }
  };

  var privateMethods = Object.create(List.prototype);
  privateMethods.insertNode = function(node, data) {

    var newNode = new Application.DataStructures._NodeList();
    newNode.setData(data);

    var next = node.getNext();
    newNode.setNext(next);
    next.setPrevious(newNode);

    node.setNext(newNode);
    newNode.setPrevious(node);

    ++this._length;
  };

  privateMethods.removeNode = function(node) {

    var next = node.getNext();
    var previous = node.getPrevious();

    node.setData(null);
    node.setNext(null);
    node.setPrevious(null);

    next.setPrevious(previous);
    previous.setNext(next);

    --this._length;
    return next;
  };

  return List;
})();
