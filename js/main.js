//Create map and dataStats variables to be used throughout code
var map;
var dataStats ={};
//Create map function 
function createMap(){
   map = L.map("mapid",{//Creating a leaflet map layer
       center: [37, -95],//Centering map on United States
       zoom: 4//Setting the zoom 
   });
   //Leaflet Tilelayer for basemap
   L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
   }).addTo(map);//adding layer to map

   getData(map);//calling getData function that will get the honeybee data
};
function calcStats(data) {//Function to retreive information about honeybee data: state, year, and properties
    //allValues is an empty array to store data obtained through below for loops
    var allValues = [];
    //for loop to go through each state in data
    for (var state of data.features) {
      //for loop for each year included in dataset starting with 1987 and ending in 2017; data in increments of every 5 years
      for (var year = 1987; year <= 2017; year += 5) {
        //obtaining the honeybee colony inventory from each state and year
        var value = state.properties["Inv_" + String(year)];
        //adding the information obtained from the value variable to the array, allValues
        allValues.push(value);
      }
    }
    //Calculating the minimum and maximum values from the data stored in the allValues array
    dataStats.min = Math.min(...allValues);
    dataStats.max = Math.max(...allValues);
    //Calculating the mean value from the data stored in the array using reduce method
    var sum = allValues.reduce(function (a, b) {
      return a + b;
    });
    dataStats.mean = sum / allValues.length;
  }
  
  //function to calculate the radius of the proportional symbols
  function calcPropRadius(attValue){
    //setting the minimum radius to 6
    var minRadius = 6;
    //Flannery Apperance Compensation formula to adjust for size perception of proportional symbols
    var radius = 0.08 * Math.pow(attValue / dataStats.min, 0.5715) * minRadius;
    return radius;//return radius value
  }
  
  //function to convert the markers to circle markers for proportional symbol construction
  function pointToLayer(feature, latlng, attributes) {
    var attribute = attributes[0];//call honeybee data from 1987, which will be represented with proportional symbols
  
    //marker options to specify visual representation of the proportional symbols
    var options = {
      fillColor: "#DCB23D",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8,
    };
  
    var attValue = Number(feature.properties[attribute]);//determine the numeric value of the selected attribute from the honeybee features
  
    options.radius = calcPropRadius(attValue);//the radius of the proportional symbol is set to the value of the attribute value
  
    var layer = L.circleMarker(latlng, options);//Creating a leaflet circle marker layer for the map with the lat and long information and specified marker options
  
    var popupContent = "<p><b>State:</b> " + feature.properties.State + "</p>";//Constructing popup content with properties of state feature 
  
    //adding data associated with the year to the popop
    var year = attribute.split("_")[1];
    popupContent +=
      "<p><b>Honeybee colony inventory in " +//Text description for the popup
      year +//Adding the year value
      ":</b> " +
      feature.properties[attribute] +//Adding the number of colonies
      " colonies</p>";//Adding the text "colonies"
  
    //Binding the popup to the circle marker (which is the proportional symbol)
    layer.bindPopup(popupContent, {
      offset: new L.Point(0, -options.radius),
    });
    //return layer to pointToLayer
    return layer;
  }
  function createPropSymbols(data, attributes) {//Function to create the proportional symbols with the data and attributes
    L.geoJson(data, {//creating a new leaflet geojson layer that calls pointToLayer function
      pointToLayer: function (feature, latlng) {
        return pointToLayer(feature, latlng, attributes);
      },
    }).addTo(map);//adding leaflet geojson layer to map
  }
  
  function getCircleValues(attribute) {//Function to calculate the minimum value and the maximum value of honeybee colonies in the data
    var min = Infinity,//Finds smallest value
      max = -Infinity;//Finds largest value
  
    map.eachLayer(function (layer) {//Obtaining the attribute values to subsequently determine miniumum and maximum attribute values
      if (layer.feature) {
        var attributeValue = Number(layer.feature.properties[attribute]);//
  
        //If this attribute value is smaller than minimum, then it becomes the minimum value
        if (attributeValue < min) {
          min = attributeValue;
        }
  
        //If this attribute value is greater than maximum, then it becomes the maximum value
        if (attributeValue > max) {
          max = attributeValue;
        }
      }
    });
  
    //create variable, mean, and set it to the sum of the maximum and minimum values divided by 2
    var mean = (max + min) / 2;
  
    //return the maximum, minimum, and mean values as objects
    return {
      max: max,
      mean: mean,
      min: min,
    };
  }
  //function to update the content of the legend
  function updateLegend(attribute) {
    var year = attribute.split("_")[1];
    //replace legend content
    document.querySelector("span.year").innerHTML = year;
  
    var circleValues = getCircleValues(attribute);//setting variable circleValues to the values calculted in the getCircleValues function
  
    for (var key in circleValues) {//for loop for getting the radius information from circleValues variable
      var radius = calcPropRadius(circleValues[key]);//radius found from calcPropRadius function and circleValues variable
      //setting attributes for radius
      document.querySelector("#" + key).setAttribute("cy", 59 - radius);//cy is y-axis coordinate of center point of the circle
      document.querySelector("#" + key).setAttribute("r", radius)//r is the radius of the circle
      //round the circleValues of honeybee inventory data for the legend and add text "colonies" after honeybee inventory data
      document.querySelector("#" + key + "-text").textContent = Math.round(circleValues[key] * 100)/100+ " colonies";

    }
  }
  
  //Function to update the proportional symbols based on their attribute values
  function updatePropSymbols(attribute) {
    map.eachLayer(function (layer) {
      if (layer.feature && layer.feature.properties[attribute]) {
        var props = layer.feature.properties;//Getting the properties of the feature layer
  
        var radius = calcPropRadius(props[attribute]);
        layer.setRadius(radius);//radius updated to reflect attribute value
        
        var popupContent = "<p><b>State:</b> " + props.State + "</p>";//Adding text string to the state popup
        var year = attribute.split("_")[1];//Attribute split by "_"; in honeybee data column headers are "Inv_year" format
        popupContent +=
          "<p><b>Honeybee colony inventories " +//Text for the honeybee popup
          year +//Adding year
          ":</b> " +
          props[attribute] +//Adding number of honeybee colonies
          " colonies</p>";
  
        popup = layer.getPopup();
        popup.setContent(popupContent).update();//Updating the popup content with the new content
      }
    });
    updateLegend(attribute);//calling updateLegend function, passing updated attribute
  }
  //function to processdata and passing "data" through
  function processData(data) {
    //create empty array to hold attribute data
    var attributes = [];
  
    //Get the properties for the first feature in the honeybee data
    var properties = data.features[0].properties;
  
    for (var attribute in properties) {//Obtaining attribute name and adding to the attributes array
      if (attribute.indexOf("Inv") > -1) {//Obtaining select attributes that contain honeybee inventory data, "Inv"
        attributes.push(attribute);//Push into attributes array
      }
    }
    return attributes;
  }
  //Function to create new sequence controls, pass "attributes" through
  function createSequenceControls(attributes){   
      
    var SequenceControl = L.Control.extend({//Placing the sequence control on the bottom left of the map to make more accessible to user
        options: {
            position: 'bottomleft'//position of the sequence control
        },
        onAdd: function () {
            //Creating sequence control container
            var container = L.DomUtil.create('div', 'sequence-control-container');
            //Creating the slider for a specific range, defined in next steps
            container.insertAdjacentHTML('beforeend', '<input class="range-slider" type="range">')
            //Creating skip buttons using forward and reverse arrow images from the Noun Project
            container.insertAdjacentHTML('beforeend', '<button class="step" id="reverse" title="Reverse"><img src="img/reverse.png"></button>'); 
            container.insertAdjacentHTML('beforeend', '<button class="step" id="forward" title="Forward"><img src="img/forward.png"></button>'); 
  
            L.DomEvent.disableClickPropagation(container);//Disable the pan/zoom default event listeners in container
  
            return container;//return the container
        }
    });
  
    map.addControl(new SequenceControl());//Adding the sequence control to the map
  
    //Setting the slider parameters 
    document.querySelector(".range-slider").max = 6;//maximum range slider vlaue
    document.querySelector(".range-slider").min = 0;//minimum range slider value
    document.querySelector(".range-slider").value = 0;
    document.querySelector(".range-slider").step = 1;//Increment range slider 1 value at a time
   
    var steps = document.querySelectorAll('.step');//create variable steps to select all range-slider parameters
  
    steps.forEach(function(step){//Function to specify rules for the steps
        step.addEventListener("click", function(){//"click" event listener
            var index = document.querySelector('.range-slider').value;
            if (step.id == 'forward'){//If forward button clicked, move forward
                index++;//move forard
                //If forward button is clicked past "6", which is the maximum slider value, then return to 0 (beginning of the slider)
                index = index > 6 ? 0 : index;//If greater than 6
            } else if (step.id == 'reverse'){//If reverse button is clicked
                index--;//move backward
                //If rreverse button is clicked past 0, then return to 6, the maximum slider value
                index = index < 0 ? 6 : index;
            };
  
            //Update the range slider to reflect changes made above
            document.querySelector('.range-slider').value = index;
  
            //Updating the proportional symbols with new attributes created in line 170
            updatePropSymbols(attributes[index]);
        })
    })
  
    //Create a listener for the range slider
    document.querySelector('.range-slider').addEventListener('input', function(){
        //new index value for the element currently selected
        var index = this.value;
  
        //Updating prop symbols again for event listener
        updatePropSymbols(attributes[index]);
    });
  
  };//Function to createLegend, passing attributes through
  function createLegend(attributes) {
    var LegendControl = L.Control.extend({//extend method to add properties to the legend
      options: {
        position: "bottomright",

      },
      onAdd: function () {
        // creating legend control container
        var container = L.DomUtil.create("div", "legend-control-container");
  
        container.innerHTML ='<pclass="temporalLegend"><b>Honeybee Colony Inventory in </b><span class="year"><b>1987</b></span></p>';
        
  
       //svg string for the attribute legend
        var svg = '<svg id="attribute-legend" width="500px" height="2800px">';
  
        //creating variable circles with the names max, mean, min, which will be used in creating attribute legend symbols
        var circles = ["max", "mean", "min"];
  
        //For loop to add circles to the svg string
        for (var i = 0; i < circles.length; i++) {
          var radius = calcPropRadius(dataStats[circles[i]]);//radius for each circle calcuated
          var cy = 127 - radius;//calculate y-axis coordinate for each circle
  
          //adding the circle infromation to the svg string
          svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + radius + '"cy="' + cy +
          '" fill="#DCB23D" fill-opacity="0.8" stroke="#000000" cx="64"/>';//color, opacity, stroke, and x-axis coordinate defined
  
          //Label spacing (35 is space between, 40 is position)
          var textY = i * 35 + 40;
  
          //Text for the attribute legend labels that states colony numbers for each proportional symbol. X value determines position of this text block.
          svg +=
            '<text id="' +
            circles[i] +
            '-text" x="130" y="' +
            textY +
            '">' +
            Math.round(dataStats[circles[i]] * 100) / 100 +
            " colonies" +
            "</text>";
        };
        //the svg string is closed so the above code will run properly.
        svg += "</svg>";
  
        //The attribute legend is added to the container created in line 253. This makes the attribute legend visible inside the legend box. 
        container.insertAdjacentHTML('beforeend',svg);
  
        return container;
      },
    });
    map.addControl(new LegendControl());//adding legend control for attribute legend
  };
  //Function to retrieve the honeybee colony data for this map. 
  function getData(map){
    //load the data
    fetch("data/Honeybee.geojson")//Fetch the honeybee data geojson from the data folder
        .then(function(response){//.then method with anonymous function that will convert data into usable form(json)
            return response.json();//return data converted into json
        })
        .then(function(json){
            var attributes = processData(json);//call processData function
            calcStats(json)//calling calcStats function
            createPropSymbols(json, attributes);//call createPropSymbols function
            createSequenceControls(attributes);//call createSequenceControls function
            createLegend(attributes);//call createLegend function
        })
  };
  
  document.addEventListener('DOMContentLoaded',createMap);//loading data onto page