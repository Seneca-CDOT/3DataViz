
var Application = Application || {};

Application.Filter = {

getCategories: function(data) {

        var categories = [];

       // var attrNameForCategory = Application.attrsMap['category'];

        categories = _.chain(data).pluck('category').unique().value();

        return categories;
    },

}