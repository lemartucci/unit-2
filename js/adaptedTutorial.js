//Create map variable and function
var map;

function createMap(){
 
    map = L.map('mapid', {
        center: [20, 0],
        zoom: 2
    });//Tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
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
function getData(map){//Getting the data
    fetch("data/MegaCities.geojson")
        .then(function(response){
            return response.json();//return data in usable form
        })
        .then(function(json){
             //pointToLayer for markers        
            var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ff7800",
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