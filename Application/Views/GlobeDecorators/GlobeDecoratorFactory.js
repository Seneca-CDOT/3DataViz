var Application = Application || {};

// decorator factory

Application.GlobeDecoratorFactory = (function() {

    var decoratorClass = Application.TextureGlobeDecorator;

    var publicMethods = {};
    publicMethods.createDecorator = function(options) {

        switch(options.visualizationList) {

            case "texture":
                decoratorClass = Application.TextureGlobeDecorator;
                break;
            case "geometry":
                decoratorClass = Application.GeometryGlobeDecorator;
                break;
        }
        return new decoratorClass();
    };

    return {

        createDecorator: publicMethods.createDecorator
    };
})();