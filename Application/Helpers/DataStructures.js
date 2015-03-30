var Application = Application || {};

Application.DataStructures = {}

Application.DataStructures._NodeList = function() {
    
  this._next = null;
  this._previous = null;

  this._data = null;
}

Application.DataStructures._NodeList.prototype.getNext = function() {

  return this._next;
};

Application.DataStructures._NodeList.prototype.getPrevious = function() {

  return this._previous;
};

Application.DataStructures._NodeList.prototype.getData = function() {

  return this._data;
};

Application.DataStructures.List = function() {
    
  // private

  this._pre_head = new Application.DataStructures._NodeList();
  this._post_tail = new Application.DataStructures._NodeList();

  this._pre_head._next = this._post_tail;
  this._post_tail._previous = this._pre_head;

  this._length = 0;
}

  // private

Application.DataStructures.List.prototype._insert = function(node, data) {

  var newNode = new Application.DataStructures._NodeList();
  newNode._data = data;

  var next = node._next;
  newNode._next = next;
  next._previous = newNode;

  node._next = newNode;
  newNode._previous = node;

  ++this._length;
};

Application.DataStructures.List.prototype._remove = function(node) {

  var next = node._next;
  var previous = node._previous;

  node._data = null;
  node._next = null;
  node._previous = null;

  next._previous = previous;
  previous._next = next;

  --this._length;
  return next;
};

// public

Application.DataStructures.List.prototype.getBegin = function() {

  return this._pre_head._next
};

Application.DataStructures.List.prototype.getEnd = function() {

  return this._post_tail;
};

Application.DataStructures.List.prototype.getLength = function() {

  return this._length;
};

Application.DataStructures.List.prototype.isEmpty = function() {

  return (this._length < 1);
};

Application.DataStructures.List.prototype.pushBack = function(data) {

   this._insert(this._post_tail._previous, data);
};

Application.DataStructures.List.prototype.popBack = function() {

  if (this._length > 0) {

    this._remove(this._post_tail._previous);
  }
};

Application.DataStructures.List.prototype.pushFront = function(data) {

   this._insert(this._pre_head, data);
};

Application.DataStructures.List.prototype.popFront = function() {

  if (this._length > 0) {

    this._remove(this._pre_head._next);
  }
};

