
// var City = Backbone.Model.extend({
// });

var GlobeModel = Backbone.Collection.extend({
  // model: City,
  loadData: function () {
  	var data = [{   city: "Montreal",
			    population: 3268513,
			    lat: 45.509,
			    lon: -73.558
			},
			{   city: "Toronto",
			    population: 2600000,
			    lat: 43.7,
			    lon: -79.416
			},
			{   city: "Vancouver",
			    population: 1837969,
			    lat: 49.25,
			    lon: -123.119
			},
			{   city: "Calgary",
			    population: 1019942,
			    lat: 51.05,
			    lon: -114.085
			},
			{   city: "Ottawa",
			    population: 812129,
			    lat: 45.411,
			    lon: -75.698
			},
			{   city: "Edmonton",
			    population: 712391,
			    lat: 53.55,
			    lon: -113.469
			},
			{   city: "Mississauga",
			    population: 668549,
			    lat: 43.579,
			    lon: -79.658
			},
			{   city: "North York",
			    population: 636000,
			    lat: 43.676,
			    lon: -79.416
			},
			{   city: "Winnipeg",
			    population: 632063,
			    lat: 49.884,
			    lon: -97.147
			},
			{   city: "Scarborough",
			    population: 600000,
			    lat: 43.772,
			    lon: -79.257
			}];

	return data;
  }
});
