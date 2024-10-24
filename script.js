// script.js

// Initialisation de la carte avec un CRS spécifique (par exemple, EPSG:3857)
const map = L.map('map', {
    crs: L.CRS.EPSG3857,
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
            geojsonData = data; // Stocker les données GeoJSON pour utilisation ultérieure
            const geojsonLayer = L.geoJSON(data, {
                onEachFeature: function (feature, layer) {
                    layer.on('click', function() {
                        const popupContent = `
                            <div>
                                <h3>Détails de l'emplacement</h3>
                                <p><strong>Latitude :</strong> ${feature.properties.Lat}</p>
                                <p><strong>Longitude :</strong> ${feature.properties.Lon}</p>
                                <p><strong>Info :</strong> ${feature.properties.Info}</p>
                                <p><strong>X Coord :</strong> ${feature.properties.xcoord}</p>
                                <p><strong>Y Coord :</strong> ${feature.properties.ycoord}</p>
                            </div>
                        `;

                        layer.bindPopup(popupContent).openPopup();
                    });

                    // Éditer le marker
                    layer.on('edit', function() {
                        updateGeoJSONLayer();
                    });

                    drawnItems.addLayer(layer);
                }
            });
            
            layerControls.addOverlay(geojsonLayer, "Données GeoJSON");
            geojsonLayer.addTo(map);
        })
        .catch(error => console.error('Erreur lors du chargement du GeoJSON :', error));
}

// Charger les données GeoJSON dès que la carte est prête
loadGeoJSON();

// Ajout d'un marker
const drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems,
        remove: false // Désactiver la suppression des objets
    },
    draw: {
        polyline: false,
        polygon: false,
        rectangle: false,
        circle: false,
        marker: true, // On permet seulement d'ajouter des markers
        circlemarker: false
    }
});
map.addControl(drawControl);

// Écoute des événements de dessin
map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    drawnItems.addLayer(layer); // Ajout du marker au groupe de couches
});
