//Create map and minValue variables
var map;
var minValue;
//Create map function and set the zoom and center
function createMap(){
   map = L.map('mapid', {
       center: [37, -95],
       zoom: 4
   });
   //Leaflet Tilelayer
   L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
   }).addTo(map);

   getData(map);
};
console.log("1");
//Calculate the minimum value of the data
function calcMinValue(data){
    var allValues = [];//Empty array to store data
    for (var state of data.features){//for loop for states
        for (var  year = 1987; year <= 2017; year+=5){//for loop for yeares
            var value = state.properties["Inv_" +String(year)];//Get population for year
            allValues.push(value);//add values to the array, allValues, and push
        }
    }
    var minValue = Math.min(...allValues)//Minimum value in the array, allValues
    return minValue;
}
console.log("2");
//Calculating radius of the proportional symbols
function calcPropRadius(attValue){
    var minRadius = 5;
    var radius = 0.02 * Math.pow(attValue/minValue, 0.5715)* minRadius//Flannery Appearance Compensation formula
    return radius;
};
console.log("3");

function pointToLayer(feature, latlng, attributes){//convert markers to circle markers and add popups
    var attribute = attributes[0];//call colony data from 1987
//create marker options
    var options = {
     fillColor: "#00ff00",
     color: "#000",
     weight: 1,
     opacity: 1,
     fillOpacity: 0.8,
    };
    var attValue = Number(feature.properties[attribute]);//determine value of selected attribute for each feature
    options.radius = calcPropRadius(attValue);//circle radius based on the value
    var layer = L.circleMarker(latlng, options);
    var popupContent = "<p><b>State:</b>" + feature.properties.State + "</p>";//popup content string
    layer.bindPopup(popupContent, {//bind popup to circle marker
        offset: new L.Point(0,-options.radius)
    });
    return layer;
};
function createPropSymbols(data, attributes){
    L.geoJson(data,{//create leaflet geojson layer
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);//add layer to map
};
function processData(data){
    var attributes=[];//Creating empty array
    var properties = data.features[0].properties;//Getting first feature in the dataset
    for (var attribute in properties){
        if(attribute.indexOf("Inv")> -1){//Looking for "Inv string" and attributes
            attributes.push(attribute);
    };
};
    console.log(attributes);

    return attributes;
};
//Creating sequence controls for slider
function createSequenceControls(attributes){
    var slider = "<input class='range-slider' type='range'></input>";//Specifies this is an input element 
    document.querySelector("#panel").insertAdjacentHTML('beforeend', slider);

    //Slider attributes
    document.querySelector(".range-slider").max = 6;//Maxiumum value of 6
    document.querySelector(".range-slider").min = 0;//Minimum value of 0
    document.querySelector(".range-slider").value= 0;//Starting at 0
    document.querySelector(".range-slider").step = 1;//Tells slider to go in increments of 1

    //Adding button for reverse
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="reverse"></button>');
   
    //Adding button for forward
    document.querySelector('#panel').insertAdjacentHTML('beforeend','<button class="step" id="forward"></button>');
    
    //Getting the reverse symbol image:
    document.querySelector('#reverse').insertAdjacentHTML('beforeend', "<img src='img/reverse.png'>")
   
    //Getting the forward symbol image:
    document.querySelector('#forward').insertAdjacentHTML('beforeend', "<img src='img/forward.png'>")


    //Click listener
    document.querySelectorAll('.step').forEach(function(step){//step for forward and back
        step.addEventListener("click", function(){//Add a click listener
            var index = document.querySelector('.range-slider').value;//Getting the current value of the range slider

            //increment and decrement based on button clicked (forward or reverse)
            if (step.id == 'forward'){//identifying button by if id "forward"
            index++;//Add 1 to index value
            index = index > 6? 0: index;//If index is greater than 6, then go back to 0
            }else if (step.id == 'reverse'){//Identifying button if id "reverse"
                index --;//
                index = index <0 ? 6: index;
            };
            document.querySelector('.range-slider').value = index;//Update the slider to index value
            console.log(attributes[index])

            updatePropSymbols(attributes[index]);
        })
    })
    //Event slider for listener
    document.querySelector('.range-slider').addEventListener('input', function(){
        var index = this.value; //represents element currently selected
        
        updatePropSymbols(attributes[index]);

    });
};
function updatePropSymbols(attribute){//Resize proportional symbols
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){ //updating the layer and popup
            //Accessing the properties of the feature layer
            var props = layer.feature.properties;
            //update radius based on attribute value
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);
            //Add state to popup content string
            var popupContent = "<p><b>State: </b>" + props.State + "</p>";

            //Add attribute to panel content string
            var year = attribute.split("_")[1];
            popupContent += "<p><b> Honeybee colony inventory on farms in " + year + ": </b>" + props[attribute] + " colonies </p>";

            //Updating the content of the popup
            popup = layer.getPopup();
            popup.setContent(popupContent).update();//updates the content
        };

    });
};//Get and load the data for map
function getData(map){
    fetch("data/Honeybee.geojson")
    .then(function(response){
        return response.json();
    })
    .then(function(json){
        var attributes = processData(json);
        minValue = calcMinValue(json);
        createPropSymbols(json, attributes);//call function to create the proportional symbols
        createSequenceControls(attributes);
    })
};

document.addEventListener('DOMContentLoaded',createMap)//call createMap function