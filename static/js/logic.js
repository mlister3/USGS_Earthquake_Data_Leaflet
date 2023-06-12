const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"; // origin data for Earthquake (Step 1)
const platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"; // origin data for tectonic plates (Step 1)

console.log("Loading d3... " + d3.version);

const loadData = () => {
  return new Promise((resolve, reject) => {
    d3.json(url).then(function (data) {
      console.log("Loading earthquake data... Finished");
      resolve(data); // resolve promise to load in Earthquake data (Step 2)
    }).catch(function (error) {
      reject(error);
    });
  });
};

const loadPlatesData = () => {
  return new Promise((resolve, reject) => {
    d3.json(platesUrl).then(function (platedata) {
      console.log("Loading tectonic plates data... Finished");
      resolve(platedata); // resolve promise to load in tectonic plates data (Step 2)
    }).catch(function (error) {
      reject(error);
    });
  });
};

loadData().then((data) => {
  console.log("Earthquake data loaded:", data);
  loadPlatesData().then((platedata) => {
    console.log("Tectonic plates data loaded:", platedata);
    createFeatures(data.features, platedata); // pass data to initial function (Step 3)
  }).catch((error) => {
    console.error("Error loading tectonic plates data:", error);
  });
}).catch((error) => {
  console.error("Error loading earthquake data:", error);
});

function createFeatures(featureData, platesMapData) {
  let earthquakeLayer = L.featureGroup(); // Create a new feature group for Earthquake data
  let platesLayer = L.featureGroup(); // Create a new feature group for tectonic platess

  // Add tectonic plates to the platesLayer
  L.geoJSON(platesMapData, {
    style: function (feature) {
      return {
        color: "red", // Set the color of the tectonic plates
        fillColor: "transparent", // Set the fill color of the tectonic plates as transparent
        weight: 2, // Set the line weight of the tectonic plates
      };
    },
    keepInView: true,
  }).addTo(platesLayer);

  function onEachFeature(feature, layer) {
    let magData = feature.properties.mag;
    let depth = feature.geometry.coordinates[2];
    let radius = magData * 5;
    let color = getColor(depth);
    let latitude = feature.geometry.coordinates[1]; // Get the latitude from the feature
    let longitude = feature.geometry.coordinates[0]; // Get the longitude from the feature

    let circle = L.circleMarker([latitude, longitude], {
      radius: radius,
      color: "black",
      weight: 1,
      fillColor: color,
      fillOpacity: 0.8,
      keepInView: true,
    }).bindPopup(
      `<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magData}<br>Depth: ${depth} km</p>`
    );

    earthquakeLayer.addLayer(circle);
  }

  L.geoJSON(featureData, {
    onEachFeature: onEachFeature,
    keepInView: true,
  });

  createMap(earthquakeLayer, platesLayer);
}

function createMap(earthquakeMapData, platesMapData) {
  let standardMap = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }
  );

  let topo = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }
  );
  
  let darkMap = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    {
      attribution: 'Map data &copy; <a href="https://www.carto.com/attribution">CARTO</a>',
    }
  );
  
  let satelliteMap = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    }
  );
  
  let baseMaps = {
    "Standard Map": standardMap,
    "Topographical Map": topo,
    "Dark Map": darkMap,
    "Satellite Map": satelliteMap,
  };

  let overlayMaps = {
    Earthquakes: earthquakeMapData,
    "Tectonic Plates": platesMapData,
  };

  let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [standardMap, earthquakeMapData, platesMapData],
    maxBounds: L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180)), // Set the maximum bounds for the map
    maxBoundsViscosity: 1.0,
    minZoom: 3, // Set the minimum zoom level to 6
  });
  
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  createLegend(myMap);
}


function getColor(depth) {
  return depth >= 90
    ? "#ff0000"
    : depth >= 70
    ? "#ff3300"
    : depth >= 50
    ? "#ff6600"
    : depth >= 30
    ? "#ff9900"
    : depth >= 10
    ? "#ffcc00"
    : "#00ff00";
}

function createLegend(map) {
  let legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "legend");
    div.style.backgroundColor = "white"; // Set the background color of the legend box

    let legendTitle = document.createElement("div");
    legendTitle.innerHTML = "<strong>Depth Legend</strong>";
    div.appendChild(legendTitle);

    let depths = [10, 30, 50, 70, 90];
    let colors = ["#00ff00", "#ffcc00", "#ff9900", "#ff6600", "#ff3300", "#ff0000"];

    // Loop through depths and generate labels with colors
    for (let i = 0; i < depths.length; i++) {
      let depth = depths[i];
      let color = colors[i];

      // Create legend item
      let legendItem = document.createElement("div");
      legendItem.innerHTML = `<span class="legend-color" style="background-color:${color}"></span> ${
        depths[i]
      }-${depths[i + 1] ? depths[i + 1] - 1 : "+"}`;
      div.appendChild(legendItem);
    }

    return div;
  };

  legend.addTo(map);
}