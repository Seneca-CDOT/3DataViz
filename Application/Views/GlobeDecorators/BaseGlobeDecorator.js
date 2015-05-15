var Application = Application || {};

Application.BaseGlobeDecorator = (function(){

	function BaseGlobeDecorator() {
	};

	// properties
    BaseGlobeDecorator.prototype.decorate = function(globeView) {

          throw 'Abstract interface is not implemented';
    };

    // TODO:
    // functionality
    // BaseGlobeDecorator.prototype. ... =

    // var privateMethods = Object.create(BaseGlobeDecorator.prototype);
    // privateMethods.privateMethod = ...

	return BaseGlobeDecorator;
})();
