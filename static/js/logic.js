const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

console.log("Loading d3... " + d3.version);

const loadData = () => {
    return new Promise((resolve, reject) => {
        d3.json(url).then(function(data){
            console.log("Loading data... Finished");
            resolve(data);
        });
    });
};

loadData()
    .then((data) => {
    console.log("Data loaded:", data);
    createFeatures(data.features);
    })

function createFeatures(featureData) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    let earthquakes = L.geoJSON(featureData, {
        onEachFeature: onEachFeature
    });

    createMap(earthquakes, featureData);
};

function createMap(earthquakeMapData, featureData){

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let baseMaps = {
        "Topographic Map": topo
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakeMapData
    };

    var circleMarkers = L.layerGroup().addTo(myMap);

    for (var i = 0; i < featureData.length; i++) {
        let indEarthquake = featureData[i].properties;
        let radius = indEarthquake.mag / 10;
        let color = "blue"
        let circle = L.circleMarker([featureData.coordinates], {
            radius: radius,
            color: color,
            fillOpacity: 0.5
        });
        circleMarkers.addLayer(circle);
    }

    let myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 3,
        layers: [topo, earthquakeMapData, circleMarkers]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

};