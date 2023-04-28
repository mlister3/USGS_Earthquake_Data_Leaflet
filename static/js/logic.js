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
    
    let earthquakes = L.geoJSON(featureData, { onEachFeature: onEachFeature });

    function onEachFeature(feature, earthquakes) {
        let magData = feature.properties.mag;
        let radius = magData / 10;
        let color = "blue"
        let circle = L.circle(
        {
            radius: radius,
            color: color,
            fillOpacity: 0.5
        }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
        earthquakes.addLayer(circle);
    }

    createMap(earthquakes);
};

function createMap(earthquakeMapData){

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let baseMaps = {
        "Topographic Map": topo
    };

    let overlayMaps = {
        Earthquakes: earthquakeMapData
    };

    let myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 3,
        layers: [topo, earthquakeMapData]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

};