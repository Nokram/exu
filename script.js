// script.js

// Initialisation de la carte avec un CRS spécifique (par exemple, EPSG:3857)
const map = L.map('map', {
    crs: L.CRS.EPSG3857, // Utilisation du CRS EPSG:3857 par défaut
}).setView([46.6034, 1.8883], 6); // Centré sur la France métropolitaine avec un niveau de zoom de 6

// Ajout de la couche de fond
const layers = {
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map)
};

// Création des contrôles pour les couches
const layerControls = L.control.layers({
    "Street": layers.streets
}).addTo(map);

// Ajout des options d'édition
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polyline: true,
        polygon: true,
        rectangle: true,
        circle: true,
        marker: true,
        circlemarker: true
    }
});
map.addControl(drawControl);

// Écoute des événements de dessin
map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    drawnItems.addLayer(layer);
});

// Fonction pour charger et afficher les données GeoJSON
function loadGeoJSON() {
    fetch("exu.geojson")  // Assurez-vous que le fichier GeoJSON est accessible
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur réseau lors du chargement du GeoJSON');
            }
            return response.json();
        })
        .then(data => {
            const geojsonLayer = L.geoJSON(data, {
                onEachFeature: function (feature, layer) {
                    if (feature.properties && feature.properties.info) {
                        layer.bindPopup("<b>" + feature.properties.info + "</b>");
                    }
                }
            });
            
            // Ajouter la couche GeoJSON au contrôle de layers pour l'activer/désactiver
            layerControls.addOverlay(geojsonLayer, "Données GeoJSON");
            geojsonLayer.addTo(map);  // Ajoute les données à la carte par défaut
        })
        .catch(error => console.error('Erreur lors du chargement du GeoJSON :', error));
}

// Charger les données GeoJSON dès que la carte est prête
loadGeoJSON();
