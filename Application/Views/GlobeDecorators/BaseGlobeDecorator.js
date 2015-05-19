var Application = Application || {};

Application.BaseGlobeDecorator = (function(){

	function BaseGlobeDecorator() {
	};

	// properties
    BaseGlobeDecorator.prototype.decorateGlobe = function(globeView) {
    };

    // functionality
    BaseGlobeDecorator.prototype.clickOnIntersect = function(globeView, intersect) {
    };

    BaseGlobeDecorator.prototype.cameraGoTo = function(globeView, destination) {
    };

    // var privateMethods = Object.create(BaseGlobeDecorator.prototype);
    // privateMethods.privateMethod = ...

	return BaseGlobeDecorator;
})();
