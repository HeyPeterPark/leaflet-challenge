// from README: 
// Plot a second data set on our map.
// Add a number of base maps to choose from as well as separate out our two different data sets into overlays that can be turned on and off independently.
// Add layer controls to our map.

// setting variables for maps
const mBox = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"

var lightMap = L.tileLayer(mBox, {
  attribution : attribution, 
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

var darkMap = L.tileLayer(mBox, {
  attribution : attribution, 
  maxZoom: 18,
  id: "mapbox.dark",
  accessToken: API_KEY
});

var satelliteMap = L.tileLayer(mBox, {
  attribution : attribution, 
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

// Creating map object centered on LA 
const myMap = L.map("map", {
  center: [34.0522, -118.2437],
  zoom: 2.5,
  layers: lightMap
});

// setting map & overlay groups for the control group
var baseMaps = {
  Light: lightMap,
  Dark: darkMap,
  Satellite: satelliteMap
};

// adding layer groups to control earthquakes and techtonic visuals separately
var quakes = new L.LayerGroup();
var plates = new L.LayerGroup();

var overlays = {
  "Earthquakes": quakes,
  "Tectonic Plates": plates
};

L.control
  .layers(baseMaps, overlays)
  .addTo(myMap);

const geoHour = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
const geoDay = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson'
const geoWeek = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
const geoMonth = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'

d3.json(geoMonth, function(data) {

  // color scale is from bright red to dark green
  // default is gray (under 1)
  function markerColor(magnitude) {
    return magnitude > 5 
      ? "#FF0000" 
      : magnitude > 4
      ? "#FF7F00"
      : magnitude > 3
      ? "#FFFF00"
      : magnitude > 2
      ? "#00FF00"
      : magnitude > 1
      ? "#008B00"
      : "#DEDEDE"
  }; 

  // slightly changed the magnitude size from step 1
  // being zoomed out exaggerated the differences too much
  function markerSize(magnitude) {
    return magnitude**2;
  };

  // magnitude marker styling calling the above 2 functions
  // black border around markers
  function markerStyle(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: markerColor(feature.properties.mag),
      color: "#000000",
      radius: markerSize(feature.properties.mag),
      stroke: true,
      weight: 0.25
    };
  }

  L.geoJson(data, {
    // plotting the markers
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // call markerStyle to change for the color and size of the marker
    style: markerStyle,
    // binding a pop up with mag & location
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(quakes);

  quakes.addTo(myMap)

  // creating everything for the legend
  // placing legend in bottom right corner
  var legend = L.control({
    position: "bottomright"
  });

  // legend color and descriptions lookups
  // info from Custom Legend Control: https://leafletjs.com/examples/choropleth/
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var magnitudes = [0, 1, 2, 3, 4, 5];
    var colors = [
      "#DEDEDE",
      "#008B00",
      "#00FF00",
      "#FFFF00",
      "#FF7F00",
      "#FF0000"
    ];

    // looping to create labels for legend box
    // descriptions: appending i + '-' + next i in magnitudes
    // last i appends a '+' since no more i
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        "<i style='background: " + colors[i] + "'></i> " +
        magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
  };
  legend.addTo(myMap);

  // Adding techtonic plate lines
  // Techtonic plate data is from https://github.com/fraxen/tectonicplates
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
    function(techPlates) {
      L.geoJson(techPlates, {
        color: "#FF69B4"
      })
      .addTo(plates);
      plates.addTo(myMap);
    });
});