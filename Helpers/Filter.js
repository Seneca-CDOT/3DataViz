
var Application = Application || {};

Application.Filter = {

getCategories: function(data) {

        var categoriesArray = [];
        var categories = [];
        categoriesArray = _.chain(data).pluck('category').unique().value();

        if(categoriesArray.length > 0 && categoriesArray[0] ){
          $.each(categoriesArray, function(index, category){
            if (category == '') category = 'unnamed';
            var obj = { name: category };
            categories.push(obj);
          });
        }

        return categories;
    },

}
