var sphere;
var radius = 75;
var galaxyRadius = radius * 10;

var paths = [];
var fromPoints = [];
var toPoints = [];
var movingGuys = [];

var dataSetPath = [{
    trip: 121,
    from:
    {   city: "Beijing",
        population: 2600000,
        lat: 39.913,
        lon: 116.391
    },
    to:{
        city: "Toronto",
        population: 2600000,
        lat: 43.7,
        lon: -79.416
    }
},
{
    trip: 122,
    from:
    {   city: "Ottawa",
        population: 812129,
        lat: 45.411,
        lon: -75.698
    },
    to:
    {   city: "Vancouver",
        population: 1837969,
        lat: 49.25,
        lon: -123.119
    },
    value: 6
},
{
    trip: 125,
    from:
    {   city: "Moscow",
        population: 812129,
        lat: 55.750,
        lon: 37.616
    },
    to:
    {   city: "Cape Town",
        population: 1837969,
        lat: -33.925,
        lon: 18.423
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "Kiev",
        population: 812129,
        lat: 50.450,
        lon: 30.523
    },
    to:
    {   city: "Amsterdam",
        population: 1837969,
        lat: 52.366,
        lon: 4.900
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "London",
        population: 812129,
        lat: 51.507,
        lon: 0.127
    },
    to:
    {   city: "Pakistan",
        population: 1837969,
        lat: 33.666,
        lon: 73.166
    },
    value: 4
},
{
    trip: 127,
    from:
    {   city: "Sydney",
        population: 812129,
        lat: -33.860,
        lon: 151.209
    },
    to:
    {   city: "Havana",
        population: 1837969,
        lat: 23.133,
        lon: -82.383
    },
    value: 4
},
{
    trip: 123,
    from:
        {   city: "Sao Paulo",
            lat: -23.550,
            lon: -46.633
        },
    to:
        {   city: "Scarborough",
            population: 600000,
            lat: 43.772,
            lon: -79.257
        },
    value: 5
}];

function map( x,  in_min,  in_max,  out_min,  out_max){
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}