//Create map variable and function
var map;

function createMap(){
 
    map = L.map('mapid', {
        center: [50, 0],
        zoom: 2
    });//Leaflet Tilelayer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',

    }).addTo(map);

    getData(map);
};
console.log("1");
//onEachFeature for popups
function onEachFeature(feature, layer) {
    var popupContent = "";
    if (feature.properties) {
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};
console.log("2");
//Getting the honeybee colony data
function getData(map){
    fetch("data/Honeybee.geojson")
        .then(function(response){
            return response.json();//return data in usable form
        })
        .then(function(json){
             //pointToLayer for markers        
            var geojsonMarkerOptions = {
                radius: 6,
                fillColor: "#00ff00",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
           L.geoJSON(json, {
                pointToLayer: function (feature, latlng){
                    return L.circleMarker(latlng, geojsonMarkerOptions); //circle marker
                }
            }).addTo(map);
        })
    }
console.log("3");
document.addEventListener('DOMContentLoaded',createMap)//call createMap function