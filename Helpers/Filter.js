
var Application = Application || {};

Application.Filter = {

getCategories: function(data) {

        var categories = [];

        categories = _.chain(data).pluck('category').unique().value();

        return categories;
    },

}