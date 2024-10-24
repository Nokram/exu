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
        featureGroup: drawnItems, // Les éléments dessinés seront ajoutés ici
        remove: false // Désactive l'option de suppression de la couche
    },
    draw: {
        polyline: false,   // Désactiver le dessin de lignes
        polygon: false,    // Désactiver le dessin de polygones
        rectangle: false,  // Désactiver le dessin de rectangles
        circle: false,     // Désactiver le dessin de cercles
        circlemarker: false, // Désactiver le dessin de cercles marqués
        marker: true,      // Activer le dessin de marqueurs
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
                    // Ajout d'un événement pour afficher le popup au clic sur le point
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

                        // Crée et ouvre le popup
                        layer.bindPopup(popupContent).openPopup();
                    });

                    // Ajout de la couche à drawnItems pour permettre l'édition
                    drawnItems.addLayer(layer);
                }
            });
            
            // Ajouter la couche GeoJSON au contrôle de layers pour l'activer/désactiver
            layerControls.addOverlay(geojsonLayer, "Données GeoJSON");
            geojsonLayer.addTo(map);  // Ajoute les données à la carte par défaut
        })
        .catch(error => console.error('Erreur lors du chargement du GeoJSON :', error));
}

// Écoute des événements d'édition
map.on('draw:edited', (event) => {
    const layers = event.layers;
    layers.eachLayer((layer) => {
        // Ici vous pouvez faire quelque chose avec le layer après l'édition
        console.log('Layer édité:', layer);
    });
});

// Charger les données GeoJSON dès que la carte est prête
loadGeoJSON();
