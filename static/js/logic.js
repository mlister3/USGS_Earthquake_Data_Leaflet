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
    })

function HOLDER() {
};

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(HOLDER);

