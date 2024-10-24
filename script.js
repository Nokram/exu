const map = L.map('map').setView([48.8566, 2.3522], 13); // Centré sur Paris

// Ajoute la couche de rue par défaut
layers.streets.addTo(map);

// Création des contrôles pour les couches
const layerControls = L.control.layers({
    "Street": layers.streets,
    "Satellite": layers.satellite
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

// Écoute les événements de dessin
map.on(L.Draw.Event.CREATED, (event) => {
    const layer = event.layer;
    drawnItems.addLayer(layer);
});

// Fonction pour charger et ajouter les markers à partir du CSV
function loadCSVData() {
    const dataLayer = L.layerGroup(); // Crée un nouveau layer group pour les données

    Papa.parse("exu.csv", {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            data.forEach(row => {
                const lat = parseFloat(row.lat);
                const lon = parseFloat(row.lon);
                const info = row.info;

                if (!isNaN(lat) && !isNaN(lon)) {
                    const marker = L.marker([lat, lon]).bindPopup(`<b>Informations</b><br>${info}`);
                    dataLayer.addLayer(marker); // Ajoute chaque marker au layer group
                }
            });

            // Ajout du layer des données au contrôle de layers pour activer/désactiver
            layerControls.addOverlay(dataLayer, "Données CSV");
            dataLayer.addTo(map); // Ajout des données à la carte au chargement
        }
    });
}

// Charger les données CSV dès que la carte est prête
loadCSVData();
