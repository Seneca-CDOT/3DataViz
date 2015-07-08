var Application = Application || {};

// decorator factory

Application.DecoratorFactory = (function() {

    var decoratorClass = Application.TextureGlobeDecorator;

    var publicMethods = {};
    publicMethods.createDecorator = function(options) {

        switch(options) {

            case "texture":
                decoratorClass = Application.TextureGlobeDecorator;
                break;
            case "geometry":
                decoratorClass = Application.GeometryGlobeDecorator;
                break;
            default:
                return null;
                break;

        }
        return new decoratorClass();
    };

    return {

        createDecorator: publicMethods.createDecorator
    };
})();